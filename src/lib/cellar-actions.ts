
'use server';

import { collection, doc, getDocs, addDoc, setDoc, deleteDoc, query, where, orderBy, writeBatch, getDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getProductById } from './product-actions';
import { getOrCreateStockItem, addStockLog } from './stock-actions';
import { toVessel, toCellarLog } from './firebase-helpers';

export type WineryVessel = {
    id: string;
    name: string;
    type: 'SS-Tank' | 'Barrel Group';
    capacityLitres: number;
    barrelCount?: number;
    currentContents: string;
}

export type CellarLogEntry = {
    id: string;
    vesselId: string;
    vesselName: string;
    productId: string;
    productName: string;
    quantityUsed: number;
    unit: string;
    reason: string;
    timestamp: string;
    producerEmail: string;
}

export interface CellarActionResponse {
    success: boolean;
    message: string;
}


export async function getVessels(producerEmail: string): Promise<WineryVessel[]> {
    try {
        const firestore = getFirestoreInstance();
        const vesselsCollection = collection(firestore, 'users', producerEmail, 'vessels');
        const snapshot = await getDocs(query(vesselsCollection, orderBy('name')));
        return snapshot.docs.map(toVessel);
    } catch (error) {
        console.error("Error getting winery vessels:", error);
        return [];
    }
}

export async function addVessel(
    producerEmail: string,
    prevState: CellarActionResponse,
    formData: FormData
): Promise<CellarActionResponse> {
    if (!producerEmail) {
        return { success: false, message: 'User not authenticated.' };
    }

    const name = formData.get('name') as string;
    const type = formData.get('type') as WineryVessel['type'];
    const capacityLitres = parseInt(formData.get('capacityLitres') as string, 10);
    const currentContents = formData.get('currentContents') as string;

    if (!name || !type || isNaN(capacityLitres)) {
        return { success: false, message: 'Name, type, and capacity are required.' };
    }

    try {
        const firestore = getFirestoreInstance();
        const vesselsCollection = collection(firestore, 'users', producerEmail, 'vessels');
        
        const newVesselData: Omit<WineryVessel, 'id'> = {
            name,
            type,
            capacityLitres,
            currentContents,
        };
        
        if (type === 'Barrel Group') {
            const barrelCountValue = formData.get('barrelCount');
            const barrelCount = barrelCountValue ? parseInt(barrelCountValue as string, 10) : 0;
            if (isNaN(barrelCount)) {
                 return { success: false, message: 'Please enter a valid number for barrel count.' };
            }
            newVesselData.barrelCount = barrelCount;
        }

        await addDoc(vesselsCollection, newVesselData);
        revalidatePath('/cellar-ops/vessels');
        return { success: true, message: 'Vessel added successfully.' };
    } catch (error) {
        console.error("Error adding vessel:", error);
        return { success: false, message: 'Failed to add vessel.' };
    }
}

export async function logAddition(prevState: CellarActionResponse, formData: FormData): Promise<CellarActionResponse> {
    const producerEmail = cookies().get('userEmail')?.value;
    const producerCompany = cookies().get('userCompany')?.value;
    
    if (!producerEmail || !producerCompany) return { success: false, message: 'User not authenticated.' };

    const vesselId = formData.get('vesselId') as string;
    const productId = formData.get('productId') as string;
    const quantityUsed = parseFloat(formData.get('quantityUsed') as string);
    const unit = formData.get('unit') as string;
    const reason = formData.get('reason') as string;
    const timestamp = formData.get('timestamp') as string;

    if (!vesselId || !productId || isNaN(quantityUsed) || !unit || !timestamp) {
        return { success: false, message: 'All fields are required to log an addition.' };
    }

    try {
        const firestore = getFirestoreInstance();
        const vesselRef = doc(firestore, 'users', producerEmail, 'vessels', vesselId);
        const product = await getProductById(productId);
        const vesselSnap = await getDoc(vesselRef);

        if (!product || !vesselSnap.exists()) {
            return { success: false, message: 'Selected vessel or product not found.' };
        }

        const vessel = toVessel(vesselSnap);
        
        // Find the stock item to decrement
        const stockItem = await getOrCreateStockItem(producerCompany, productId);
        const newStockQuantity = stockItem.quantity - quantityUsed;

        if (newStockQuantity < 0) {
            return { success: false, message: `Not enough stock for ${product.name}. Available: ${stockItem.quantity}, Tried to use: ${quantityUsed}.` };
        }
        
        const batch = writeBatch(firestore);

        // 1. Create the cellar log entry
        const logRef = doc(collection(firestore, 'users', producerEmail, 'cellar-log'));
        const newLogEntry: Omit<CellarLogEntry, 'id'> = {
            vesselId,
            vesselName: vessel.name,
            productId,
            productName: product.name,
            quantityUsed,
            unit,
            reason,
            timestamp,
            producerEmail
        };
        batch.set(logRef, newLogEntry);

        // 2. Update the stock item quantity
        const stockItemRef = doc(firestore, 'stockItems', stockItem.id);
        batch.update(stockItemRef, { quantity: newStockQuantity });

        // 3. Add a log to the stock item's history
        const stockLogRef = doc(collection(firestore, 'stockItems', stockItem.id, 'logs'));
        batch.set(stockLogRef, {
            stockItemId: stockItem.id,
            timestamp: new Date().toISOString(),
            type: 'Cellar Addition',
            change: -quantityUsed,
            newQuantity: newStockQuantity,
            notes: `Used in ${vessel.name}. Reason: ${reason}`
        });

        await batch.commit();

        revalidatePath('/cellar-ops/activity-log');
        revalidatePath('/cellar-ops/inventory');
        
        return { success: true, message: `Successfully logged addition to ${vessel.name}.` };
    } catch (error) {
        console.error('Error logging addition:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
