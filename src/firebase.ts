// FIX: The original code used Firebase v9 modular syntax, which caused module export errors.
// Switched to Firebase v8 namespaced syntax for compatibility.
import firebase from 'firebase/app';

const initializeFirebase = async () => {
  // FIX: Use firebase.apps (v8) instead of getApps() (v9) to check for initialization.
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
    // FIX: Use firebase.initializeApp (v8) instead of initializeApp() (v9).
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return;
  }
};

export { initializeFirebase };