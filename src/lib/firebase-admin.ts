import * as admin from 'firebase-admin';

// The exact key from your validated sidebar
const serviceAccount = {
  projectId: "winespace-8-77371789-69e4d",
  clientEmail: "firebase-adminsdk-fbsvc@winespace-8-77371789-69e4d.iam.gserviceaccount.com",
  // This uses the private key we verified in Screenshot 12.58.13
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDh...\n-----END PRIVATE KEY-----\n".replace(/\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
