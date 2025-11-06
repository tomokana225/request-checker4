// FIX: Switch to compat library to resolve module resolution error for initializeApp and getApps.
import firebase from 'firebase/compat/app';

const initializeFirebase = async () => {
  // Check if Firebase has already been initialized to avoid re-initialization errors.
  if (firebase.apps.length > 0) {
    return;
  }
  
  try {
    // Fetch the Firebase configuration from our secure serverless function.
    // This is a good practice to avoid exposing config in client-side source code.
    const response = await fetch('/api/songs?action=getFirebaseConfig');
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config from server. Status: ${response.status}`);
    }
    const firebaseConfig = await response.json();

    // A crucial check to ensure we have a valid configuration before proceeding.
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      console.error("Firebase config is invalid or missing an API key. Firebase will not be initialized.");
      return; // Stop initialization if config is bad.
    }

    // Initialize Firebase with the fetched configuration.
    firebase.initializeApp(firebaseConfig);

  } catch (error) {
    // Catch any errors during the fetch or initialization process and log them.
    // This prevents the entire app from crashing if Firebase can't be reached.
    console.error("Firebase initialization process failed:", error);
  }
};

export { initializeFirebase };