
'use server';

import { collection, doc, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getUserByEmail } from './user-actions';
import { sendDeliveryRecordEmail } from './email-actions';
import { toDeliveryRecord } from './firebase-helpers';


export type DeliveryRecord = {
    id: string;
    producerEmail: string;
    consignor: string;
    consignee: string;
    deliveryDate: string;
    deliveryRecordNo: string;
    sawis6No?: string;
    wsbRecordNo?: string;
    vintage: string;
    productDescription: string;
    fromContainer?: string;
    volumeLitres: number;
    vehicleRegistration: string;
    consignorSignaturePath?: string;
    driverSignaturePath?: string;
    createdAt: string;
};

export interface DeliveryRecordResponse {
    success: boolean;
    message: string;
    recordId?: string;
}

const deliveryRecordsCollection = collection(getFirestoreInstance(), 'deliveryRecords');


// Helper function to handle file uploads
async function uploadFile(file: File, prefix: string): Promise<string | undefined> {
    if (!file || file.size === 0) return undefined;
    
    const uploadsDirPath = require('path').join(process.cwd(), 'public/uploads');
    const fs = require('fs').promises;
    await fs.mkdir(uploadsDirPath, { recursive: true });
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${prefix}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = `/uploads/${fileName}`;
    
    await fs.writeFile(require('path').join(process.cwd(), `public${filePath}`), fileBuffer);
    
    return filePath;
}


export async function createDeliveryRecord(
    prevState: DeliveryRecordResponse,
    formData: FormData
): Promise<DeliveryRecordResponse> {
    const cookieStore = cookies();
    const producerEmail = cookieStore.get('userEmail')?.value;

    if (!producerEmail) {
        return { success: false, message: 'You must be logged in to create a record.' };
    }

    try {
        const consignorSignatureFile = formData.get('consignorSignature') as File;
        const driverSignatureFile = formData.get('driverSignature') as File;

        const [consignorSignaturePath, driverSignaturePath] = await Promise.all([
            uploadFile(consignorSignatureFile, 'consignor-sig'),
            uploadFile(driverSignatureFile, 'driver-sig'),
        ]);
        
        const volumeLitres = parseFloat(formData.get('volumeLitres') as string);
        if (isNaN(volumeLitres)) {
            return { success: false, message: 'Please enter a valid number for volume.' };
        }

        const newRecordData: Omit<DeliveryRecord, 'id'> = {
            producerEmail,
            consignor: formData.get('consignor') as string,
            consignee: formData.get('consignee') as string,
            deliveryDate: formData.get('deliveryDate') as string,
            deliveryRecordNo: formData.get('deliveryRecordNo') as string,
            sawis6No: formData.get('sawis6No') as string || undefined,
            wsbRecordNo: formData.get('wsbRecordNo') as string || undefined,
            vintage: formData.get('vintage') as string,
            productDescription: formData.get('productDescription') as string,
            fromContainer: formData.get('fromContainer') as string || undefined,
            volumeLitres: volumeLitres,
            vehicleRegistration: formData.get('vehicleRegistration') as string,
            consignorSignaturePath: consignorSignaturePath,
            driverSignaturePath: driverSignaturePath,
            createdAt: new Date().toISOString(),
        };

        const newDocRef = await addDoc(deliveryRecordsCollection, newRecordData);
        const savedRecord = { id: newDocRef.id, ...newRecordData };
        
        revalidatePath('/sawis/delivery-records');
        
        // Asynchronously send email after successful save, but don't block the response
        // This is a "fire and forget" call. The main operation succeeds even if the email fails.
        triggerEmailNotification(savedRecord as DeliveryRecord, producerEmail);

        return { success: true, message: 'Delivery record created successfully!', recordId: newDocRef.id };

    } catch (error) {
        console.error("Error creating delivery record:", error);
        return { success: false, message: 'An internal server error occurred while saving the record.' };
    }
}

// This helper function runs in the background and won't block the main server action response.
async function triggerEmailNotification(record: DeliveryRecord, producerEmail: string) {
    try {
        const producer = await getUserByEmail(producerEmail);
        if (producer) {
             await sendDeliveryRecordEmail({
                producer: producer,
                record: record,
                // For this feature, the email is sent to the producer themselves for their records.
                recipientEmail: producer.email,
            });
        }
    } catch (emailError) {
        // Log the error but don't fail the primary operation, as the data is already saved.
        console.error("Failed to send delivery record email notification:", emailError);
    }
}

export async function getDeliveryRecords(producerEmail: string): Promise<DeliveryRecord[]> {
    try {
        const q = query(deliveryRecordsCollection, where("producerEmail", "==", producerEmail), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toDeliveryRecord);
    } catch (error) {
        console.error("Error getting delivery records:", error);
        return [];
    }
}
