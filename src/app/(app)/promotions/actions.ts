
'use server';

import { revalidatePath } from 'next/cache';
import type { Promotion, PromotionResponse } from '@/lib/promotion-actions';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

const promotionsCollection = collection(getFirestoreInstance(), 'promotions');

export async function createPromotion(
    supplierCompany: string,
    prevState: PromotionResponse,
    formData: FormData
): Promise<PromotionResponse> {
    
    if (!supplierCompany) {
        return { success: false, message: 'User not found. Please log in again.' };
    }

    const productId = formData.get('productId') as string;
    const productName = formData.get('productName') as string;
    const discountPercentage = parseInt(formData.get('discountPercentage') as string, 10);

    if (!productId || !productName || !discountPercentage) {
        return { success: false, message: 'Please fill all fields.' };
    }
    if (discountPercentage <= 0 || discountPercentage > 90) {
        return { success: false, message: 'Discount must be between 1% and 90%.' };
    }

    try {
        // Check if a promotion for this product by this supplier already exists.
        const q = query(promotionsCollection, where("productId", "==", productId), where("supplierCompany", "==", supplierCompany));
        const existing = await getDocs(q);
        if (!existing.empty) {
            return { success: false, message: 'A promotion for this product already exists.' };
        }

        const newPromotion: Omit<Promotion, 'id'> = {
            productId,
            productName,
            discountPercentage,
            supplierCompany,
            createdAt: new Date().toISOString(),
            isFeatured: false,
        };

        await addDoc(promotionsCollection, newPromotion);

        revalidatePath('/promotions');
        revalidatePath('/admin/promotions');
        revalidatePath('/(app)', 'layout');

        return { success: true, message: `Promotion for ${productName} created successfully!` };

    } catch (error) {
        console.error('Error creating promotion:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
