
'use server';

import { collection, doc, getDocs, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { toOffender } from './firebase-helpers';

export type Offender = {
    id: string;
    name: string;
    company: string;
    email?: string;
    telephone?: string;
    reason: string;
    reportedBy: string;
    dateAdded: string;
};

export interface OffenderActionResponse {
  success: boolean;
  message: string;
}


const offendersCollection = collection(getFirestoreInstance(), 'offenders');

export async function getOffenders(): Promise<Offender[]> {
    try {
        const snapshot = await getDocs(offendersCollection);
        return snapshot.docs.map(toOffender);
    } catch (error) {
        console.error("Error getting offenders:", error);
        return [];
    }
}

export async function addOffender(
    prevState: OffenderActionResponse,
    formData: FormData
): Promise<OffenderActionResponse> {
    
    const cookieStore = cookies();
    const reportedBy = cookieStore.get('userEmail')?.value;

    if (!reportedBy) {
        return { success: false, message: 'You must be logged in to report an offender.' };
    }

    const name = formData.get('name') as string;
    const reason = formData.get('reason') as string;

    if (!name || !reason) {
        return { success: false, message: 'Name and reason are required.' };
    }

    try {
        const newOffenderData: Omit<Offender, 'id'> = {
            name,
            company: formData.get('company') as string || '',
            email: formData.get('email') as string || '',
            telephone: formData.get('telephone') as string || '',
            reason,
            reportedBy,
            dateAdded: new Date().toISOString(),
        };

        await addDoc(offendersCollection, newOffenderData);

        revalidatePath('/admin/red-flag-zone');
        return { success: true, message: 'Offender successfully added to the Red Flag Zone.' };
    } catch (error) {
        console.error('Error adding offender:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function updateOffender(
    offenderId: string,
    prevState: OffenderActionResponse,
    formData: FormData
): Promise<OffenderActionResponse> {
    if (!offenderId) {
        return { success: false, message: 'Offender ID is missing.' };
    }

    const name = formData.get('name') as string;
    const reason = formData.get('reason') as string;

    if (!name || !reason) {
        return { success: false, message: 'Name and reason are required.' };
    }

    try {
        const firestore = getFirestoreInstance();
        const offenderRef = doc(firestore, 'offenders', offenderId);
        const updateData = {
            name,
            company: formData.get('company') as string || '',
            email: formData.get('email') as string || '',
            telephone: formData.get('telephone') as string || '',
            reason,
        };

        await setDoc(offenderRef, updateData, { merge: true });

        revalidatePath('/admin/red-flag-zone');
        revalidatePath('/red-flag-zone');

        return { success: true, message: 'Offender details updated successfully.' };

    } catch (error) {
        console.error('Error updating offender:', error);
        return { success: false, message: 'An internal server error occurred while updating.' };
    }
}


export async function deleteOffender(
    prevState: OffenderActionResponse,
    formData: FormData
): Promise<OffenderActionResponse> {
    const offenderId = formData.get('offenderId') as string;
    if (!offenderId) {
        return { success: false, message: 'Offender ID is missing.' };
    }

    try {
        const firestore = getFirestoreInstance();
        await deleteDoc(doc(firestore, 'offenders', offenderId));
        revalidatePath('/admin/red-flag-zone');
        revalidatePath('/red-flag-zone');
        return { success: true, message: 'Offender removed successfully.' };
    } catch (error) {
        console.error('Error deleting offender:', error);
        return { success: false, message: 'Failed to remove offender.' };
    }
}
