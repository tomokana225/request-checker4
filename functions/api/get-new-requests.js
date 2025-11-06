// This serverless function runs on Cloudflare.
// It retrieves new song requests that were submitted via the form (i.e., not anonymous likes).

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

    try {
        const requestsRef = collection(db, 'songRequests');
        
        // First, query by the most recent requests. This avoids needing a composite index.
        // We fetch more items than needed (e.g., 200) to ensure we can find enough non-anonymous requests.
        const q = query(
            requestsRef, 
            orderBy('lastRequestedAt', 'desc'),
            limit(200)
        );
        
        const querySnapshot = await getDocs(q);
        const allRecentRequests = [];
        querySnapshot.forEach((doc) => {
            allRecentRequests.push({
                id: doc.id, // This is the song title
                ...doc.data()
            });
        });

        // Second, filter out anonymous requests in the function's code.
        const newRequests = allRecentRequests
            .filter(req => req.lastRequester !== 'anonymous')
            .slice(0, 100); // Apply the final limit after filtering.
        
        return new Response(JSON.stringify(newRequests), { 
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                ...CORS_HEADERS
            } 
        });

    } catch (error) {
        console.warn('Get new requests failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch new requests.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
    }
}