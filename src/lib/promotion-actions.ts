
'use server';

import { collection, doc, getDocs, addDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { toPromotion } from './firebase-helpers';

export type Promotion = {
    id: string;
    productId: string;
    productName: string;
    discountPercentage: number;
    supplierCompany: string;
    createdAt: string;
    isFeatured?: boolean;
};

export interface PromotionResponse {
  success: boolean;
  message: string;
}

const promotionsCollection = collection(getFirestoreInstance(), 'promotions');


export async function getPromotions(supplierCompany?: string): Promise<Promotion[]> {
    try {
        let q = query(promotionsCollection);
        if (supplierCompany) {
            q = query(promotionsCollection, where("supplierCompany", "==", supplierCompany));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toPromotion);
    } catch (error) {
        console.error("Error getting promotions:", error);
        return [];
    }
}

export async function deletePromotion(
    prevState: PromotionResponse,
    formData: FormData
): Promise<PromotionResponse> {
     const promotionId = formData.get('promotionId') as string;
     if (!promotionId) {
        return { success: false, message: 'Promotion ID not found.' };
     }

    try {
        const firestore = getFirestoreInstance();
        const promotionRef = doc(firestore, 'promotions', promotionId);
        await deleteDoc(promotionRef);
        
        revalidatePath('/promotions');
        revalidatePath('/admin/promotions');
        revalidatePath('/(app)', 'layout');

        return { success: true, message: 'Promotion deleted successfully.' };
    } catch (error) {
        console.error('Error deleting promotion:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function toggleFeaturedStatus(
    promotionId: string,
    currentStatus: boolean
): Promise<{ success: boolean; message?: string }> {
    if (!promotionId) {
        return { success: false, message: 'Missing promotion ID.' };
    }

    try {
        const firestore = getFirestoreInstance();
        const promoRef = doc(firestore, 'promotions', promotionId);
        
        await setDoc(promoRef, { isFeatured: !currentStatus }, { merge: true });

        // Revalidate the pages that display this information
        revalidatePath('/admin/promotions');
        revalidatePath('/(app)', 'layout'); // Revalidates the layout containing the promotions widget

        return { success: true };
    } catch (error) {
        console.error('Error toggling featured status:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
