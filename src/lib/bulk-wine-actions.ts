
'use server';

import { collection, doc, getDocs, addDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { toBulkWineListing } from './firebase-helpers';
import { logAuditEvent } from './audit-log-actions';

export type BulkWineListing = {
    id: string;
    producer: string;
    cultivar: string;
    vintage: string;
    litres: number;
    pricePerLitre: number;
    region: string;
    contact: string;
    createdAt: string;
    ipw: 'Yes' | 'No';
    wieta: 'Yes' | 'No';
};

export interface CreateListingResponse {
  success: boolean;
  message: string;
}

const listingsCollection = collection(getFirestoreInstance(), 'bulkWineListings');


export async function getBulkWineListings(): Promise<BulkWineListing[]> {
    try {
        const snapshot = await getDocs(listingsCollection);
        return snapshot.docs.map(toBulkWineListing);
    } catch (error) {
        console.error("Error getting bulk wine listings:", error);
        return [];
    }
}

export async function getBulkWineListingById(id: string): Promise<BulkWineListing | null> {
    try {
        const firestore = getFirestoreInstance();
        const docRef = doc(firestore, 'bulkWineListings', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? toBulkWineListing(docSnap) : null;
    } catch (error) {
        console.error(`Error getting bulk wine listing by id ${id}:`, error);
        return null;
    }
}

export async function createBulkWineListing(
    prevState: CreateListingResponse,
    formData: FormData
): Promise<CreateListingResponse> {
    const cookieStore = cookies();
    const producerCompanyFromCookie = cookieStore.get('userCompany')?.value;
    const producerEmail = cookieStore.get('userEmail')?.value;
    const userRole = cookieStore.get('userRole')?.value;

    const producerCompanyFromForm = formData.get('producer') as string;
    
    // Admin can select a producer, otherwise it comes from the logged-in user's cookie.
    const producerCompany = userRole === 'Admin' ? producerCompanyFromForm : producerCompanyFromCookie;

    if (!producerCompany || !producerEmail) {
        return { success: false, message: 'User not found. Please log in again.' };
    }

    const cultivar = formData.get('cultivar') as string;
    const vintage = formData.get('vintage') as string;
    const litres = parseInt(formData.get('litres') as string, 10);
    const pricePerLitreFromForm = parseFloat(formData.get('pricePerLitre') as string);
    const region = formData.get('region') as string;
    const ipw = formData.get('ipw') as BulkWineListing['ipw'];
    const wieta = formData.get('wieta') as BulkWineListing['wieta'];

    if (!cultivar || !vintage || !litres || isNaN(pricePerLitreFromForm) || !region || !ipw || !wieta) {
        return { success: false, message: 'Please fill out all required fields.' };
    }
    
    // Add the R1.00 commission to the price provided by the user.
    const finalPricePerLitre = pricePerLitreFromForm + 1.00;

    try {
        const newListingData: Omit<BulkWineListing, 'id'> = {
            producer: producerCompany,
            contact: producerEmail,
            cultivar,
            vintage,
            litres,
            pricePerLitre: finalPricePerLitre,
            region,
            ipw,
            wieta,
            createdAt: new Date().toISOString(),
        };

        const newDoc = await addDoc(listingsCollection, newListingData);

        await logAuditEvent({
            actor: { email: producerEmail, role: userRole || 'Producer', company: producerCompany },
            event: 'BULK_LISTING_CREATED',
            entity: { type: 'BULK_WINE_LISTING', id: newDoc.id },
            details: {
                summary: `${producerCompany} created bulk listing for ${vintage} ${cultivar}.`,
                price: finalPricePerLitre,
                volume: litres,
            }
        });


        revalidatePath('/bulk-wine-market');
        return { success: true, message: 'Your bulk wine has been successfully listed.' };

    } catch (error) {
        console.error('Error creating bulk wine listing:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function updateBulkWineListing(
    listingId: string,
    prevState: CreateListingResponse,
    formData: FormData
): Promise<CreateListingResponse> {
    const cookieStore = cookies();
    const userCompany = cookieStore.get('userCompany')?.value;
    const userRole = cookieStore.get('userRole')?.value;
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userCompany || !userRole || !userEmail) {
        return { success: false, message: 'Authentication error. Please log in again.' };
    }

    if (!listingId) {
        return { success: false, message: 'Listing ID is missing.' };
    }

    try {
        const firestore = getFirestoreInstance();
        const listingRef = doc(firestore, 'bulkWineListings', listingId);
        const listingDoc = await getDoc(listingRef);
        if (!listingDoc.exists()) {
            return { success: false, message: 'Listing not found.' };
        }

        const listing = toBulkWineListing(listingDoc);

        // Security Check: Only admin or the owner can update.
        if (userRole !== 'Admin' && listing.producer !== userCompany) {
            return { success: false, message: 'You are not authorized to update this listing.' };
        }
        
        const cultivar = formData.get('cultivar') as string;
        const vintage = formData.get('vintage') as string;
        const litres = parseInt(formData.get('litres') as string, 10);
        const pricePerLitre = parseFloat(formData.get('pricePerLitre') as string);
        const region = formData.get('region') as string;
        const ipw = formData.get('ipw') as BulkWineListing['ipw'];
        const wieta = formData.get('wieta') as BulkWineListing['wieta'];
    
        if (!cultivar || !vintage || !litres || !pricePerLitre || !region || !ipw || !wieta) {
            return { success: false, message: 'Please fill out all required fields.' };
        }
    
        const updateData: Partial<Omit<BulkWineListing, 'id' | 'producer' | 'contact' | 'createdAt'>> = {
            cultivar,
            vintage,
            litres,
            pricePerLitre,
            region,
            ipw,
            wieta,
        };
        
        await setDoc(listingRef, updateData, { merge: true });

        await logAuditEvent({
            actor: { email: userEmail, role: userRole, company: userCompany },
            event: 'BULK_LISTING_UPDATED',
            entity: { type: 'BULK_WINE_LISTING', id: listingId },
            details: {
                summary: `${userCompany} updated bulk listing for ${vintage} ${cultivar}.`,
                changes: updateData
            }
        });


        revalidatePath('/bulk-wine-market');
        revalidatePath(`/bulk-wine-market/edit/${listingId}`);
        return { success: true, message: 'Listing updated successfully.' };

    } catch (error) {
        console.error('Error updating bulk wine listing:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}


export async function deleteBulkWineListing(
    prevState: { success: boolean; message: string },
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    const listingId = formData.get('listingId') as string;

    const cookieStore = cookies();
    const userCompany = cookieStore.get('userCompany')?.value;
    const userRole = cookieStore.get('userRole')?.value;
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userCompany || !userRole || !userEmail) {
        return { success: false, message: 'Authentication error. Please log in again.' };
    }

    if (!listingId) {
        return { success: false, message: 'Listing ID is missing.' };
    }

    try {
        const firestore = getFirestoreInstance();
        const listingRef = doc(firestore, 'bulkWineListings', listingId);
        const listingDoc = await getDoc(listingRef);
        if (!listingDoc.exists()) {
            return { success: false, message: 'Listing not found.' };
        }

        const listing = toBulkWineListing(listingDoc);

        // Security Check: Only admin or the owner can delete.
        if (userRole !== 'Admin' && listing.producer !== userCompany) {
            return { success: false, message: 'You are not authorized to delete this listing.' };
        }

        await deleteDoc(listingRef);

        await logAuditEvent({
            actor: { email: userEmail, role: userRole, company: userCompany },
            event: 'BULK_LISTING_DELETED',
            entity: { type: 'BULK_WINE_LISTING', id: listingId },
            details: {
                summary: `${userCompany} deleted bulk listing for ${listing.vintage} ${listing.cultivar}.`,
            }
        });

        revalidatePath('/bulk-wine-market');
        return { success: true, message: 'Listing deleted successfully.' };
    } catch (error) {
        console.error('Error deleting bulk wine listing:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
