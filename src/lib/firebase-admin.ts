import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Use a clear, local filename
const keyPath = path.resolve(process.cwd(), 'winespace-service-account.json');

if (!admin.apps.length) {
  try {
    if (fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "winespace-8",
        databaseURL: "https://winespace-8-default-rtdb.africa-south1.firebasedatabase.app"
      });
      console.log("Success: Admin initialized with winespace-service-account.json");
    } else {
      console.error("Critical: winespace-service-account.json not found at " + keyPath);
    }
  } catch (error) {
    console.error("Initialization Error:", error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
