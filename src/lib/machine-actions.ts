
'use server';

import { collection, doc, getDocs, addDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { toMachine } from './firebase-helpers';

export type Machine = {
    id: string;
    name: string;
    operatorName?: string;
    type: 'Bottling' | 'Labelling' | 'Other';
    status: 'Operational' | 'Under Maintenance' | 'Decommissioned';
    specifications: string;
    serviceProviderCompany: string;
};

export interface MachineActionResponse {
  success: boolean;
  message: string;
}

const machinesCollection = collection(getFirestoreInstance(), 'machines');


export async function getMachines(companyName: string): Promise<Machine[]> {
    try {
        const q = query(machinesCollection, where("serviceProviderCompany", "==", companyName));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toMachine);
    } catch (error) {
        console.error("Error getting machines:", error);
        return [];
    }
}

export async function addMachine(
    prevState: MachineActionResponse,
    formData: FormData
): Promise<MachineActionResponse> {
    const name = formData.get('name') as string;
    const operatorName = formData.get('operatorName') as string;
    const type = formData.get('type') as Machine['type'];
    const status = formData.get('status') as Machine['status'];
    const specifications = formData.get('specifications') as string;
    const serviceProviderCompany = formData.get('serviceProviderCompany') as string;

    if (!name || !type || !status || !serviceProviderCompany) {
        return { success: false, message: 'Please fill out all required fields.' };
    }

    try {
        const newMachineData: Omit<Machine, 'id'> = {
            name,
            operatorName,
            type,
            status,
            specifications,
            serviceProviderCompany
        };

        await addDoc(machinesCollection, newMachineData);

        revalidatePath('/machines');
        return { success: true, message: 'Machine added successfully.' };

    } catch (error) {
        console.error('Error adding machine:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function updateMachine(
    machineId: string,
    prevState: MachineActionResponse,
    formData: FormData
): Promise<MachineActionResponse> {
    const name = formData.get('name') as string;
    const operatorName = formData.get('operatorName') as string;
    const type = formData.get('type') as Machine['type'];
    const status = formData.get('status') as Machine['status'];
    const specifications = formData.get('specifications') as string;
    
    if (!name || !type || !status) {
        return { success: false, message: 'Please fill out all required fields.' };
    }
    
    try {
        const firestore = getFirestoreInstance();
        const machineRef = doc(firestore, 'machines', machineId);
        await setDoc(machineRef, { name, operatorName, type, status, specifications }, { merge: true });
        
        revalidatePath('/machines');
        return { success: true, message: 'Machine updated successfully.' };

    } catch (error) {
        console.error('Error updating machine:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function deleteMachine(
    machineId: string
): Promise<MachineActionResponse> {
    try {
        const firestore = getFirestoreInstance();
        const machineRef = doc(firestore, 'machines', machineId);
        await deleteDoc(machineRef);
        
        revalidatePath('/machines');
        return { success: true, message: 'Machine deleted successfully.' };
    } catch (error) {
        console.error('Error deleting machine:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
