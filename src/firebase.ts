
// FIX: The original import `import { initializeApp, getApps } from 'firebase/app';`
// is for Firebase v9+ modular SDK. The error "Module has no exported member"
// suggests an older version of Firebase (v8 or below) is used, which uses a
// namespaced syntax.
import firebase from 'firebase/app';

const initializeFirebase = async () => {
  // FIX: Use Firebase v8 namespaced syntax to check for existing apps.
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
    // FIX: Use Firebase v8 namespaced syntax for initialization.
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return;
  }
};

export { initializeFirebase };
