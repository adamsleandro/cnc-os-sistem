import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// CRITICAL CONSTRAINT: Test connection on boot (Phase 0)
async function testConnection() {
  try {
    // Only attempt if not in a server environment or during build
    if (typeof window !== 'undefined') {
      await getDocFromServer(doc(db, '_connection_test_', 'init'));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
    // Note: Permission denied is expected for this dummy path, that's fine, 
    // it confirms we reached the server.
  }
}
testConnection();
