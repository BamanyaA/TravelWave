import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// Use the firestoreDatabaseId from the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firebase connected successfully");
  } catch (error: any) {
    if (error.message?.includes('offline')) {
      console.error("Firebase is offline. Check configuration.");
    }
  }
}
testConnection();
