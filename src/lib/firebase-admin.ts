import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (serviceAccountKey) {
    try {
      // This specifically fixes the common private_key newline issue
      const serviceAccount = JSON.parse(serviceAccountKey);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "winespace-8", databaseURL: "https://winespace-8-default-rtdb.africa-south1.firebasedatabase.app",
        databaseURL: "https://winespace-8-default-rtdb.africa-south1.firebasedatabase.app"
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  } else {
    console.error('SERVICE_ACCOUNT_KEY is missing');
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
