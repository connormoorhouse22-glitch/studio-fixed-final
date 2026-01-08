
'use client';

import { useEffect, useRef } from 'react';
import { useFirebase } from '@/firebase/provider';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

// Updates presence every 2 minutes
const HEARTBEAT_INTERVAL = 2 * 60 * 1000;

export function PresenceUpdater() {
  const { firestore } = useFirebase();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !firestore) return;

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    const userDocRef = doc(firestore, 'users', userEmail);

    const updatePresence = () => {
      setDoc(userDocRef, { 
        isOnline: true, 
        lastSeen: serverTimestamp() 
      }, { merge: true }).catch(console.error);
    };

    // Initial update on mount
    updatePresence();

    // Set up heartbeat interval
    intervalRef.current = setInterval(updatePresence, HEARTBEAT_INTERVAL);

    // Set offline on unload
    const handleUnload = () => {
        if (firestore && userEmail) {
            setDoc(doc(firestore, 'users', userEmail), { isOnline: false }, { merge: true });
        }
    };
    
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      // Clean up interval and event listener
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleUnload);
      
      // Attempt to set user offline when component unmounts (e.g., on logout)
      handleUnload();
    };
  }, [firestore]);

  return null; // This component does not render anything
}
