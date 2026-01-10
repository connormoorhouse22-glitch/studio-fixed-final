import * as admin from 'firebase-admin';

// Reverting to the exact Service Account logic
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT_KEY || '{}')),
    projectId: "winespace-8-77371789-69e4d"
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
