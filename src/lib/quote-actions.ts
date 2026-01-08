
'use server';

import { collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { toRFQ } from './firebase-helpers';

export type Quote = {
    id: string;
    rfqId: string;
    supplierCompany: string;
    price: number;
    notes: string;
    createdAt: string;
};

export type RFQ = {
    id: string;
    title: string;
    category: string;
    quantity: number;
    description: string;
    deliveryDate?: string;
    attachment?: string;
    status: 'Pending' | 'Responded' | 'Accepted' | 'Rejected';
    producerCompany: string;
    producerEmail: string;
    createdAt: string;
    quotes: Quote[];
};

export interface CreateRfqResponse {
  success: boolean;
  message: string;
}

const rfqsCollection = collection(getFirestoreInstance(), 'rfqs');


export async function createRfq(
    prevState: CreateRfqResponse,
    formData: FormData
): Promise<CreateRfqResponse> {
    const cookieStore = cookies();
    const producerEmail = cookieStore.get('userEmail')?.value;
    const producerCompany = cookieStore.get('userCompany')?.value;

    if (!producerEmail || !producerCompany) {
        return { success: false, message: 'User not found. Please log in again.' };
    }

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const description = formData.get('description') as string;
    const deliveryDate = formData.get('deliveryDate') as string;
    const attachment = formData.get('attachment') as File;

    if (!title || !category || !quantity || !description) {
        return { success: false, message: 'Please fill all required fields.' };
    }

    try {
        let attachmentPath: string | undefined = undefined;

        if (attachment && attachment.size > 0) {
            const uploadsDirPath = require('path').join(process.cwd(), 'public/uploads');
            const fs = require('fs').promises;
            await fs.mkdir(uploadsDirPath, { recursive: true });
            const attachmentBuffer = Buffer.from(await attachment.arrayBuffer());
            const fileName = `${Date.now()}-${attachment.name}`;
            attachmentPath = `/uploads/${fileName}`;
            await fs.writeFile(require('path').join(process.cwd(), `public${attachmentPath}`), attachmentBuffer);
        }
        
        const newRfqData: Omit<RFQ, 'id'> = {
            title,
            category,
            quantity,
            description,
            deliveryDate,
            attachment: attachmentPath,
            status: 'Pending',
            producerCompany,
            producerEmail,
            createdAt: new Date().toISOString(),
            quotes: [],
        };
        
        await addDoc(rfqsCollection, newRfqData);

        revalidatePath('/quotes');
        return { success: true, message: 'Your RFQ has been submitted to all relevant suppliers.' };

    } catch (error) {
        console.error('Error creating RFQ:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function getRfqsForProducer(producerEmail: string): Promise<RFQ[]> {
    try {
        const q = query(rfqsCollection, where("producerEmail", "==", producerEmail));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toRFQ);
    } catch (error) {
        console.error("Error getting RFQs for producer:", error);
        return [];
    }
}

export async function getRfqsForSuppliers(category?: string): Promise<RFQ[]> {
    try {
        // In a real app, you'd filter by supplier category, but for now, all suppliers see all RFQs.
        const q = query(rfqsCollection, where("status", "in", ["Pending", "Responded"]));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toRFQ);
    } catch (error) {
        console.error("Error getting RFQs for suppliers:", error);
        return [];
    }
}

export async function getRfqById(id: string): Promise<RFQ | null> {
    try {
        const firestore = getFirestoreInstance();
        const rfqRef = doc(firestore, 'rfqs', id);
        const docSnap = await getDoc(rfqRef);
        return docSnap.exists() ? toRFQ(docSnap) : null;
    } catch (error) {
        console.error(`Error getting RFQ by id ${id}:`, error);
        return null;
    }
}

export async function addQuoteToRfq(
    rfqId: string,
    prevState: { success: boolean, message: string },
    formData: FormData
): Promise<{ success: boolean, message: string }> {

    const cookieStore = cookies();
    const supplierCompany = cookieStore.get('userCompany')?.value;
    if (!supplierCompany) {
        return { success: false, message: 'Could not identify supplier.' };
    }

    const price = parseFloat(formData.get('price') as string);
    const notes = formData.get('notes') as string;

    if (isNaN(price) || price <= 0) {
        return { success: false, message: 'Please enter a valid price.' };
    }

    try {
        const firestore = getFirestoreInstance();
        const rfqRef = doc(firestore, 'rfqs', rfqId);
        const rfqSnap = await getDoc(rfqRef);
        if (!rfqSnap.exists()) {
            return { success: false, message: 'RFQ not found.' };
        }
        
        const rfq = toRFQ(rfqSnap);
        const existingQuotes = rfq.quotes || [];
        
        if (existingQuotes.some(q => q.supplierCompany === supplierCompany)) {
            return { success: false, message: 'You have already submitted a quote for this request.' };
        }

        const newQuote: Quote = {
            id: `Q-${Date.now()}`,
            rfqId,
            supplierCompany,
            price,
            notes,
            createdAt: new Date().toISOString(),
        };

        const updatedQuotes = [...existingQuotes, newQuote];
        await updateDoc(rfqRef, { quotes: updatedQuotes, status: 'Responded' });
        
        revalidatePath(`/quotes/requests/${rfqId}`);
        revalidatePath('/quotes/requests');
        revalidatePath(`/quotes/${rfqId}`);
        
        return { success: true, message: 'Your quote has been successfully submitted.' };
    } catch (error) {
        console.error('Error adding quote:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
