// FIX: Use named imports for Firebase v9+ modular SDK compatibility.
import { initializeApp, getApps } from 'firebase/app';

const initializeFirebase = async () => {
  // FIX: Call getApps() directly as a function.
  if (getApps().length > 0) {
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
    // FIX: Call initializeApp() directly as a function.
    initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return;
  }
};

export { initializeFirebase };