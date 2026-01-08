
'use server';

import { collection, doc, getDocs, addDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { toDiaryEntry } from './firebase-helpers';

export type DiaryEntry = {
    id: string;
    title: string;
    startTime: string;
    endTime?: string;
    location?: string;
    notes?: string;
    visibility: 'Private' | 'Company';
    createdBy: string;
    company: string;
};

export interface DiaryActionResponse {
  success: boolean;
  message: string;
}

const diariesCollection = collection(getFirestoreInstance(), 'diaries');


// Updated to accept an object with user details
export async function getDiaryEntries(userDetails: { userEmail: string; userCompany: string; }): Promise<DiaryEntry[]> {
    const { userEmail, userCompany } = userDetails;

    if (!userEmail || !userCompany) {
        console.error("User details were not provided to getDiaryEntries");
        return [];
    }
    
    try {
        const companyQuery = query(
            diariesCollection,
            where("company", "==", userCompany),
            where("visibility", "==", "Company")
        );
        const privateQuery = query(
            diariesCollection,
            where("createdBy", "==", userEmail),
            where("visibility", "==", "Private")
        );

        const [companySnapshot, privateSnapshot] = await Promise.all([
            getDocs(companyQuery),
            getDocs(privateQuery),
        ]);

        const allEntriesMap = new Map<string, DiaryEntry>();
        companySnapshot.docs.map(toDiaryEntry).forEach(entry => allEntriesMap.set(entry.id, entry));
        privateSnapshot.docs.map(toDiaryEntry).forEach(entry => allEntriesMap.set(entry.id, entry));
        
        return Array.from(allEntriesMap.values());

    } catch (error) {
        console.error("Error getting diary entries:", error);
        return [];
    }
}

export async function addOrUpdateDiaryEntry(
    prevState: DiaryActionResponse,
    formData: FormData
): Promise<DiaryActionResponse> {
    const cookieStore = cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    const userCompany = cookieStore.get('userCompany')?.value;
    
    if (!userEmail || !userCompany) {
        return { success: false, message: 'An internal server error occured.' };
    }

    const entryId = formData.get('entryId') as string | null;
    const title = formData.get('title') as string;
    const datePart = formData.get('datePart') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string | null;
    const location = formData.get('location') as string;
    const notes = formData.get('notes') as string;
    const visibility = formData.get('visibility') as DiaryEntry['visibility'];

    if (!title || !datePart || !startTime || !visibility) {
        return { success: false, message: 'Title, date, start time, and visibility are required.' };
    }
    
    const startDateTime = new Date(datePart);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    let endDateTime: Date | undefined;
    if (endTime) {
        endDateTime = new Date(datePart);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes);
    }

    const entryData: Omit<DiaryEntry, 'id'> = {
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime?.toISOString(),
        location,
        notes,
        visibility,
        createdBy: userEmail,
        company: userCompany,
    };
    
    try {
        const firestore = getFirestoreInstance();
        if (entryId) {
            const entryRef = doc(firestore, 'diaries', entryId);
            await setDoc(entryRef, entryData, { merge: true });
        } else {
            await addDoc(diariesCollection, entryData);
        }
        revalidatePath('/diary');
        return { success: true, message: `Entry ${entryId ? 'updated' : 'created'} successfully.` };
    } catch (error) {
        console.error('Error saving diary entry:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}


export async function deleteDiaryEntry(
    entryId: string,
    prevState: DiaryActionResponse
): Promise<DiaryActionResponse> {
    if (!entryId) {
        return { success: false, message: 'Entry ID is missing.' };
    }

    try {
        const firestore = getFirestoreInstance();
        await deleteDoc(doc(firestore, 'diaries', entryId));
        revalidatePath('/diary');
        return { success: true, message: 'Entry deleted successfully.' };
    } catch (error) {
        console.error('Error deleting diary entry:', error);
        return { success: false, message: 'Failed to delete entry.' };
    }
}
