
'use server';

import { collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, writeBatch, orderBy } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { getProductById } from './product-actions';
import { cookies } from 'next/headers';
import { toStockItem, toStockLog } from './firebase-helpers';

export type StockItem = {
    id: string;
    producerCompany: string;
    productId: string;
    productName: string;
    supplier: string;
    image: string;
    quantity: number;
    lowStockThreshold?: number;
}

export type StockLog = {
    id: string;
    stockItemId: string;
    timestamp: string;
    type: 'Order Delivered' | 'Manual Addition' | 'Manual Consumption' | 'Initial Stock' | 'Cellar Addition';
    change: number;
    newQuantity: number;
    notes?: string;
}

export interface StockActionResponse {
    success: boolean;
    message?: string;
}

const stockItemsCollection = collection(getFirestoreInstance(), 'stockItems');


export async function getStockItems(producerCompany: string): Promise<StockItem[]> {
    try {
        const q = query(stockItemsCollection, where("producerCompany", "==", producerCompany));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toStockItem);
    } catch (error) {
        console.error("Error getting stock items:", error);
        return [];
    }
}

export async function getStockLogs(stockItemId: string): Promise<StockLog[]> {
    try {
        const logsCollection = collection(getFirestoreInstance(), 'stockItems', stockItemId, 'logs');
        const q = query(logsCollection, orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toStockLog);
    } catch (error) {
        console.error("Error getting stock logs:", error);
        return [];
    }
}

export async function getOrCreateStockItem(producerCompany: string, productId: string): Promise<StockItem> {
     const firestore = getFirestoreInstance();
     const q = query(stockItemsCollection, where("producerCompany", "==", producerCompany), where("productId", "==", productId));
     const snapshot = await getDocs(q);

     if (!snapshot.empty) {
        return toStockItem(snapshot.docs[0]);
     } else {
        const product = await getProductById(productId);
        if (!product) {
            throw new Error(`Product with ID ${productId} not found.`);
        }
        const newStockItemData: Omit<StockItem, 'id'> = {
            producerCompany,
            productId,
            productName: product.name,
            supplier: product.supplier,
            image: product.image,
            quantity: 0,
        };
        const newDocRef = await addDoc(stockItemsCollection, newStockItemData);
        return { id: newDocRef.id, ...newStockItemData };
     }
}

export async function addStockLog(stockItemId: string, logData: Omit<StockLog, 'id' | 'stockItemId'>) {
    const logsCollection = collection(getFirestoreInstance(), 'stockItems', stockItemId, 'logs');
    await addDoc(logsCollection, { ...logData, stockItemId });
}

export async function createStockItem(prevState: StockActionResponse, formData: FormData): Promise<StockActionResponse> {
    const cookieStore = cookies();
    const producerCompany = cookieStore.get('userCompany')?.value;

    if (!producerCompany) {
        return { success: false, message: 'Authentication error. Please log in again.' };
    }

    const productId = formData.get('productId') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const notes = formData.get('notes') as string;

    if (!productId || isNaN(quantity) || quantity < 0) {
        return { success: false, message: 'Please select a product and enter a valid quantity.' };
    }

    try {
        const existingStockItem = await getDocs(query(stockItemsCollection, where("producerCompany", "==", producerCompany), where("productId", "==", productId)));
        if (!existingStockItem.empty) {
            return { success: false, message: 'This product already exists in your inventory. Please use the "Adjust Stock" button to change its quantity.' };
        }

        const product = await getProductById(productId);
        if (!product) {
            return { success: false, message: 'Selected product not found in the catalog.' };
        }

        const newStockItemData: Omit<StockItem, 'id'> = {
            producerCompany,
            productId,
            productName: product.name,
            supplier: product.supplier,
            image: product.image,
            quantity,
        };
        
        const newDocRef = await addDoc(stockItemsCollection, newStockItemData);

        await addStockLog(newDocRef.id, {
            timestamp: new Date().toISOString(),
            type: 'Initial Stock',
            change: quantity,
            newQuantity: quantity,
            notes: notes || 'Initial stock added manually',
        });

        revalidatePath('/inventory');
        return { success: true, message: `${product.name} has been added to your inventory.` };

    } catch (error) {
        console.error("Error creating stock item:", error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function updateStockLevelForOrder(producerCompany: string, productId: string, quantityChange: number, orderId: string): Promise<void> {
    const stockItem = await getOrCreateStockItem(producerCompany, productId);
    const newQuantity = stockItem.quantity + quantityChange;

    const stockItemRef = doc(getFirestoreInstance(), 'stockItems', stockItem.id);
    await setDoc(stockItemRef, { quantity: newQuantity }, { merge: true });

    await addStockLog(stockItem.id, {
        timestamp: new Date().toISOString(),
        type: 'Order Delivered',
        change: quantityChange,
        newQuantity: newQuantity,
        notes: `From Order #${orderId}`
    });
}


export async function updateStockLevel(stockItemId: string, prevState: StockActionResponse, formData: FormData): Promise<StockActionResponse> {
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const adjustmentType = formData.get('adjustmentType') as 'addition' | 'consumption';
    const notes = formData.get('notes') as string;

    if (isNaN(quantity) || quantity <= 0) {
        return { success: false, message: 'Please enter a valid positive quantity.' };
    }
    
    try {
        const firestore = getFirestoreInstance();
        const stockItemRef = doc(firestore, 'stockItems', stockItemId);
        const stockItemSnap = await getDoc(stockItemRef);
        if (!stockItemSnap.exists()) {
            return { success: false, message: 'Stock item not found.' };
        }
        
        const currentItem = toStockItem(stockItemSnap);
        const change = adjustmentType === 'addition' ? quantity : -quantity;
        const newQuantity = currentItem.quantity + change;

        if (newQuantity < 0) {
            return { success: false, message: 'Cannot consume more stock than is available.' };
        }

        await setDoc(stockItemRef, { quantity: newQuantity }, { merge: true });

        await addStockLog(stockItemId, {
            timestamp: new Date().toISOString(),
            type: adjustmentType === 'addition' ? 'Manual Addition' : 'Manual Consumption',
            change: change,
            newQuantity: newQuantity,
            notes: notes || undefined
        });

        revalidatePath('/inventory');
        return { success: true, message: 'Stock level updated successfully.' };

    } catch (error) {
        return { success: false, message: 'An error occurred while updating stock.' };
    }
}


export async function setLowStockThreshold(stockItemId: string, prevState: StockActionResponse, formData: FormData): Promise<StockActionResponse> {
    const threshold = parseInt(formData.get('threshold') as string, 10);

    if (isNaN(threshold) || threshold < 0) {
        return { success: false, message: 'Please enter a valid, non-negative threshold.' };
    }
    
    try {
        const firestore = getFirestoreInstance();
        const stockItemRef = doc(firestore, 'stockItems', stockItemId);
        await setDoc(stockItemRef, { lowStockThreshold: threshold }, { merge: true });

        revalidatePath('/inventory');
        return { success: true, message: 'Low stock alert threshold has been set.' };
    } catch(error) {
        return { success: false, message: 'An error occurred while setting the threshold.' };
    }
}
