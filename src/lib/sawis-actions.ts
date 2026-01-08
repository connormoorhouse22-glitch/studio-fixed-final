
'use server';

import { collection, doc, getDocs, addDoc, query, where, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { Sawis7Row } from '@/app/(app)/sawis/returns/form';
import { toSawisReturn } from './firebase-helpers';

export type SawisReturn = {
  id: string;
  producerEmail: string;
  month: string;
  createdAt: string; 
  openingBalances: Sawis7Row;
  transactions: any[];
  closingBalances: Sawis7Row;
  overleafPriceData: any;
  overleafContainerData: any;
  sawis6FilePaths?: string[];
};

export interface SawisReturnActionResponse {
  success: boolean;
  message: string;
}

const sawisReturnsCollection = collection(getFirestoreInstance(), 'sawisReturns');

export async function saveSawisReturn(
    producerEmail: string, 
    month: string, 
    fullReturnData: Omit<SawisReturn, 'id' | 'producerEmail' | 'month' | 'createdAt'>
) {
  try {
    const newReturnData = {
      producerEmail,
      month,
      createdAt: new Date().toISOString(),
      ...fullReturnData,
    };
    await addDoc(sawisReturnsCollection, newReturnData);
  } catch (error) {
    console.error('Error saving SAWIS return:', error);
  }
}


export async function getLatestSawisReturn(producerEmail: string): Promise<SawisReturn | null> {
  if (!producerEmail) return null;
  try {
    const q = query(
      sawisReturnsCollection,
      where('producerEmail', '==', producerEmail),
      orderBy('createdAt', 'desc'), 
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    return toSawisReturn(snapshot.docs[0]);
  } catch (error) {
    console.error('Error getting latest SAWIS return:', error);
    return null;
  }
}

export async function getAllSawisReturns(): Promise<SawisReturn[]> {
    try {
        const q = query(sawisReturnsCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toSawisReturn);
    } catch (error) {
        console.error("Error getting all SAWIS returns:", error);
        return [];
    }
}

export async function deleteSawisReturn(
    returnId: string,
    prevState: SawisReturnActionResponse
): Promise<SawisReturnActionResponse> {
    if (!returnId) {
        return { success: false, message: 'Return ID is missing.' };
    }

    try {
        const firestore = getFirestoreInstance();
        await deleteDoc(doc(firestore, 'sawisReturns', returnId));
        revalidatePath('/sawis/history');
        return { success: true, message: 'Return deleted successfully.' };
    } catch (error) {
        console.error('Error deleting SAWIS return:', error);
        return { success: false, message: 'Failed to delete the return.' };
    }
}
