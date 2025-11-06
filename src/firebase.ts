import firebase from 'firebase/app';

const initializeFirebase = async () => {
  // FIX: Use Firebase v8 syntax `firebase.apps.length` instead of v9's `getApps().length` to check if Firebase is already initialized.
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
    // FIX: Use Firebase v8 syntax `firebase.initializeApp()` instead of v9's standalone `initializeApp()`.
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return;
  }
};

export { initializeFirebase };