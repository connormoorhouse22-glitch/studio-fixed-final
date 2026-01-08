import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 1. HARDCODED CONFIG - Verified from your SDK setup
export const firebaseConfig = {
  apiKey: "AIzaSyCF2OqNVsYErOLvpGGEhEQnhbqutayzaXI",
  authDomain: "winespace-8-77371789-69e4d.firebaseapp.com",
  projectId: "winespace-8-77371789-69e4d",
  storageBucket: "winespace-8-77371789-69e4d.firebasestorage.app",
  messagingSenderId: "562008173653",
  appId: "1:562008173653:web:0cf3571926bceb832378dc"
};

// 2. INITIALIZE
// This ensures we don't initialize the app twice if the browser reloads
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// This forces the app to look at the "(default)" database we verified in the terminal
const db = getFirestore(app, "(default)");
const auth = getAuth(app);
const storage = getStorage(app);

// 3. THE "BRIDGE" EXPORTS
// These match the internal imports used by your Admin Portal pages
export const getFirestoreInstance = () => db; 

export { app, db, auth, storage };
export default app;