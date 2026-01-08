
'use server';

import { db } from './firebase'; 
import { collection, query, where, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { User, UpdateUserResponse } from './users';
import { sendProducerWelcomeEmail, sendSupplierWelcomeEmail, sendAdminNewUserNotification } from './email-actions';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from './audit-log-actions';
import { toUser } from './firebase-helpers';

const usersCollection = collection(db, 'users');
const serviceOptionsCollection = collection(db, 'serviceOptions');

export async function getFiltrationOptions(providerCompany: string): Promise<string[]> {
    if (!providerCompany) return [];
    try {
        const docRef = doc(serviceOptionsCollection, providerCompany.toLowerCase().replace(/\s+/g, '-'));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().options || [];
        }
        return [];
    } catch (error) {
        console.error("Error getting filtration options:", error);
        return [];
    }
}

export async function updateFiltrationOptions(providerCompany: string, options: string[]): Promise<{success: boolean; message?: string}> {
     if (!providerCompany) return { success: false, message: 'Provider company not specified.'};
     try {
        const docRef = doc(serviceOptionsCollection, providerCompany.toLowerCase().replace(/\s+/g, '-'));
        await setDoc(docRef, { options }, { merge: true });
        revalidatePath('/services/filtration');
        return { success: true };
     } catch (error) {
        console.error("Error updating filtration options:", error);
        return { success: false, message: 'Failed to update options in the database.' };
     }
}


export async function getUsers(): Promise<User[]> {
    try {
        const querySnapshot = await getDocs(usersCollection);
        return querySnapshot.docs.map(toUser);
    } catch (error) {
        console.error("Error in getUsers:", error);
        return [];
    }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    try {
        const q = query(usersCollection, where('email', '==', email.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return toUser(querySnapshot.docs[0]);
    } catch (error) {
        return null;
    }
}

export async function getProducerNames(): Promise<string[]> {
    try {
        const q = query(usersCollection, where('role', '==', 'Producer'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data().company as string).sort();
    } catch (error) {
        return [];
    }
}

export async function getUserByCompany(companyName: string): Promise<User | null> {
    if (!companyName) return null;
    try {
        const q = query(usersCollection, where('company', '==', companyName));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return toUser(querySnapshot.docs[0]);
    } catch (error) {
        return null;
    }
}

export async function getSuppliersByService(serviceName: string): Promise<User[]> {
    try {
        const q = query(usersCollection, where('services', 'array-contains', serviceName));
        const querySnapshot = await getDocs(q);
        const suppliers = querySnapshot.docs.map(toUser);
        
        return suppliers.filter(s => {
            if (s.company === 'Technofill') {
                return s.name === 'Piet Matthee';
            }
            return true;
        });
    } catch (error) {
        return [];
    }
}

export async function updateUser(
    userEmail: string,
    prevState: { message: string },
    formData: FormData
): Promise<UpdateUserResponse> {
    if (!userEmail) return { message: 'User email not provided.' };
    try {
        const userRef = doc(db, 'users', userEmail);
        const updateData: any = {};
        
        // General form fields
        if (formData.has('name')) updateData.name = formData.get('name') as string;
        if (formData.has('company')) updateData.company = formData.get('company') as string;
        if (formData.has('role')) updateData.role = formData.get('role') as string;
        if (formData.has('status')) updateData.status = formData.get('status') as string;
        if (formData.has('contactNumber')) updateData.contactNumber = formData.get('contactNumber') as string || '';
        if (formData.has('vatNumber')) updateData.vatNumber = formData.get('vatNumber') as string || '';
        if (formData.has('billingAddress')) updateData.billingAddress = formData.get('billingAddress') as string || '';

        await setDoc(userRef, updateData, { merge: true });
        revalidatePath('/users');
        revalidatePath('/services/filtration');
        return { message: 'Success' };
    } catch (error) {
        console.error('Error updating user:', error);
        return { message: 'Update failed.' };
    }
}


export async function addUser(user: Omit<User, 'id'>) {
    await setDoc(doc(db, 'users', user.email), user);
    await sendAdminNewUserNotification(user);
}

export async function approveUser(email: string) {
    const userRef = doc(db, 'users', email);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;
    await setDoc(userRef, { status: 'Active' }, { merge: true });
    const user = toUser(userDoc);
    if (user.role === 'Producer') await sendProducerWelcomeEmail(user);
    else await sendSupplierWelcomeEmail(user);
    revalidatePath('/users');
}

export async function deleteUser(email: string): Promise<{ message: string }> {
    try {
        await deleteDoc(doc(db, 'users', email));
        revalidatePath('/users');
        return { message: 'Success' };
    } catch (error) {
        return { message: 'Failed' };
    }
}
