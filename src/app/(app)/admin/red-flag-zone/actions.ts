
'use server';

import { collection, doc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { Offender } from '@/lib/offender-actions';
import { cookies } from 'next/headers';

const offendersCollection = collection(getFirestoreInstance(), 'offenders');
const toOffender = (doc: any): Offender => ({ id: doc.id, ...doc.data() } as Offender);

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
    prevState: { success: boolean; message: string },
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    
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

export async function deleteOffender(id: string): Promise<{ success: boolean; message: string }> {
    try {
        await deleteDoc(doc(offendersCollection, id));
        revalidatePath('/admin/red-flag-zone');
        return { success: true, message: 'Offender removed successfully.' };
    } catch (error) {
        console.error('Error deleting offender:', error);
        return { success: false, message: 'Failed to remove offender.' };
    }
}
