
'use client';

import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

export const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider: React.FC<
  React.PropsWithChildren<{ value: FirebaseContextValue }>
> = ({ value, children }) => {
  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
};

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  const { app } = useFirebase();
  if (!app) {
    throw new Error('Firebase app not available');
  }
  return app;
}

export function useFirestore() {
  const { firestore } = useFirebase();
  if (!firestore) {
    throw new Error('Firestore not available');
  }
  return firestore;
}

export function useAuth() {
  const { auth } = useFirebase();
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }
  return auth;
}
