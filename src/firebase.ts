import { initializeApp, getApps } from 'firebase/app';

const initializeFirebase = async () => {
  // getApps() を使用して、Firebaseがすでに初期化されているか確認します。
  if (getApps().length > 0) {
    // Firebaseはすでに初期化済みです。
    return;
  }
  
  try {
    const response = await fetch('/api/songs?action=getFirebaseConfig');
    if (!response.ok) {
      throw new Error('Firebase設定の取得に失敗しました');
    }
    const firebaseConfig = await response.json();
    if (!firebaseConfig.apiKey) {
      console.error("Firebase設定にAPIキーがありません。Firebaseは初期化されません。");
      return;
    }
    // Firebase v9のモジュラー構文で初期化します。
    initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebaseの初期化エラー:", error);
    return;
  }
};

export { initializeFirebase };