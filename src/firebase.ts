// FIX: Switched to Firebase v8 compat syntax to resolve module export errors.
// This is often necessary in client-side setups where dependency resolution can be tricky.
import firebase from 'firebase/compat/app';

const initializeFirebase = async () => {
  // Firebase is already initialized, do nothing.
  if (firebase.apps.length > 0) {
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