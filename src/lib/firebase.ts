import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "winespace-8-77371789-69e4d.firebaseapp.com",
  projectId: "winespace-8-77371789-69e4d",
  storageBucket: "winespace-8-77371789-69e4d.appspot.com",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
