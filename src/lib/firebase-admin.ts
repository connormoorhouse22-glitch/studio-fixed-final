import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;

if (!admin.apps.length && serviceAccountKey) {
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.project_id
    });
  } catch (error) {
    console.error("LOGIN_FIX_FAILED", error);
  }
}

export const dbAdmin = admin.firestore();
export const authAdmin = admin.auth();
