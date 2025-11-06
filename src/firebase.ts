// FIX: The Firebase SDK version on the client appears to be v8 or a similar version
// that does not use modular, named exports from 'firebase/app'. The original v9 syntax
// `import { initializeApp, getApps } from 'firebase/app'` was causing an error.
// Switched to the v8 syntax which uses a default `firebase` export.
import firebase from 'firebase/app';

const initializeFirebase = async () => {
  if (firebase.apps.length > 0) {
    // Firebase is already initialized, do nothing.
    return;
  }
  
  try {
    const response = await fetch('/api/songs?action=getFirebaseConfig');
    if (!response.ok) {
      throw new Error('Failed to fetch Firebase config');
    }
    const firebaseConfig = await response.json();
    if (!firebaseConfig.apiKey) {
      console.error("Firebase config is missing API key. Firebase will not be initialized.");
      return;
    }
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return;
  }
};

export { initializeFirebase };