import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// This looks for the file we just verified exists in your sidebar
const keyPath = path.resolve(process.cwd(), 'winespace-service-account.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "winespace-8-77371789-69e4d"
    });
    console.log("DEV LOGIN: Firebase Admin connected successfully");
  } catch (error) {
    console.error("DEV LOGIN ERROR:", error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
