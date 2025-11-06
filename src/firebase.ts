// FIX: Switched to a namespace import for Firebase to resolve module export errors.
// This is a common workaround for build tool configurations that struggle with Firebase's module structure.
import * as firebase from 'firebase/app';

const initializeFirebase = async () => {
  if (firebase.getApps().length > 0) {
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