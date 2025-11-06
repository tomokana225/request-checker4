// This serverless function runs on Cloudflare, not in the user's browser.
// It logs song requests to Firestore.

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, runTransaction } from 'firebase/firestore/lite';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }

    const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
    
    let app;
    try {
        app = await getFirebaseApp(env);
    } catch (e) {
        console.warn("Firebase Init Failed:", e.message);
        return jsonResponse({ error: "Server configuration error." }, 500);
    }

    const db = getFirestore(app);

    try {
        const { term, artist, requester } = await request.json();

        if (!term || typeof term !== 'string' || term.trim().length === 0) {
            return jsonResponse({ error: "Invalid song title provided." }, 400);
        }
        
        const songTitle = term.trim();
        const safeKey = songTitle.replace(/\./g, '_');
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = (now.getMonth() + 1).toString().padStart(2, '0');
        
        const isAnonymousRequest = !requester || requester.trim() === '';

        await runTransaction(db, async (transaction) => {
            // 1. Update all-time request count
            const requestRef = doc(db, 'songRequests', songTitle);
            const requestDoc = await transaction.get(requestRef);
            const newRequestCount = (requestDoc.data()?.count || 0) + 1;
            const dataToSet = { 
                count: newRequestCount,
                artist: artist || '',
                lastRequester: isAnonymousRequest ? 'anonymous' : requester,
                isAnonymous: isAnonymousRequest,
                lastRequestedAt: Date.now()
            };
            transaction.set(requestRef, dataToSet, { merge: true });
            
            // 2. Update monthly request count
            const monthlyRef = doc(db, 'monthlyRequestCounts', `${yyyy}-${mm}`);
            const monthlyDoc = await transaction.get(monthlyRef);
            const monthlyData = monthlyDoc.data() || {};
            const newMonthlyCount = (monthlyData[safeKey]?.count || 0) + 1;
            transaction.set(monthlyRef, { [safeKey]: { count: newMonthlyCount, artist: artist || '' } }, { merge: true });

            // 3. Update yearly request count
            const yearlyRef = doc(db, 'yearlyRequestCounts', `${yyyy}`);
            const yearlyDoc = await transaction.get(yearlyRef);
            const yearlyData = yearlyDoc.data() || {};
            const newYearlyCount = (yearlyData[safeKey]?.count || 0) + 1;
            transaction.set(yearlyRef, { [safeKey]: { count: newYearlyCount, artist: artist || '' } }, { merge: true });
        });

        return jsonResponse({ success: true });

    } catch (error) {
        console.warn('Logging request failed:', error);
        return jsonResponse({ error: 'Failed to log request.' }, 500);
    }
}