// This serverless function runs on Cloudflare.
// It retrieves the song like ranking data from Firestore.

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore/lite';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getFirebaseApp(env) {
    if (getApps().length) {
        return getApps()[0];
    }
    const firebaseConfig = {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
        appId: env.FIREBASE_APP_ID,
        measurementId: env.FIREBASE_MEASUREMENT_ID,
    };
    
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error("Firebase environment variables are not set correctly.");
    }
    
    return initializeApp(firebaseConfig);
}

const processRankingData = (songData) => {
    return Object.entries(songData)
        .map(([title, details]) => ({
            id: title.replace(/_/g, '.'), // Restore original title
            ...details
        }))
        .sort((a, b) => b.count - a.count);
};


export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }

    let app;
    try {
        app = await getFirebaseApp(env);
    } catch (e) {
        console.warn("Firebase Init Failed:", e.message);
        return new Response(JSON.stringify({ error: "Server configuration error." }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
    }

    const db = getFirestore(app);
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all'; // 'all', 'month', 'year'

    try {
        let songRanking = [];

        if (period === 'all') {
            const countsRef = collection(db, 'songLikeCounts');
            const q = query(countsRef, orderBy('count', 'desc'), limit(100));
            const querySnapshot = await getDocs(q);
            songRanking = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            const now = new Date();
            let docId;
            let collectionName;
            if (period === 'month') {
                const yyyy = now.getFullYear();
                const mm = (now.getMonth() + 1).toString().padStart(2, '0');
                docId = `${yyyy}-${mm}`;
                collectionName = 'monthlyLikeCounts';
            } else { // year
                docId = `${now.getFullYear()}`;
                collectionName = 'yearlyLikeCounts';
            }
            
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                songRanking = processRankingData(docSnap.data());
            }
        }
        
        return new Response(JSON.stringify(songRanking), { 
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300',
                ...CORS_HEADERS
            } 
        });

    } catch (error) {
        console.warn('Get like ranking failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch like rankings.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }
}
