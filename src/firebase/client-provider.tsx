
'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider, type FirebaseContextValue } from './provider';

export const FirebaseClientProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [firebase, setFirebase] = useState<FirebaseContextValue>({
    app: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    // Firebase should only be initialized on the client.
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
};
