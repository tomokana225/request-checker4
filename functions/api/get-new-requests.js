// This serverless function runs on Cloudflare.
// It retrieves a list of songs requested via the form (not "likes").

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

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

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
});

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'GET') {
        return jsonResponse({ error: 'Method Not Allowed' }, 405);
    }

    let app;
    try {
        app = await getFirebaseApp(env);
    } catch (e) {
        console.warn("Firebase Init Failed:", e.message);
        return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const db = getFirestore(app);

    try {
        const requestsRef = collection(db, 'songRequests');
        // Get requests where the requester is not 'anonymous'
        const q = query(
            requestsRef, 
            where('lastRequester', '!=', 'anonymous'), 
            orderBy('lastRequestedAt', 'desc'), 
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        
        const newRequests = [];
        querySnapshot.forEach((doc) => {
            newRequests.push({
                id: doc.id, // This is the song title
                ...doc.data()
            });
        });
        
        return jsonResponse(newRequests);

    } catch (error) {
        console.warn('Get new requests failed:', error);
        return jsonResponse({ error: 'Failed to fetch new requests.' }, 500);
    }
}