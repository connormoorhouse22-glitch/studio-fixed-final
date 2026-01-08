
'use server';

import { collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { sendBookingRequestEmail, sendBookingStatusUpdateEmail } from './email-actions';
import { getUserByCompany } from './userActions';
import type { User } from './users';
import { toBooking } from './firebase-helpers';
import { cookies } from 'next/headers';

export type WorkOrder = {
    service: 'Mobile Bottling' | 'Mobile Labelling';
    contactPerson: string;
    contactNumber: string;
    location: string;
    volumeLiters: number;
    bottleType: string;
    closureType: 'Cork' | 'Screwcap' | 'Crown cap' | 'Stelvin Lux' | 'Other';
    cultivar: string;
    vintage: string;
    filtrationType?: string;
    specialInstructions?: string;
};

export type Booking = {
    id: string;
    date: string;
    status: 'pending' | 'confirmed' | 'rejected';
    producerCompany: string;
    producerEmail: string;
    providerCompany: string;
    workOrders: WorkOrder[];
    assignedMachineId?: string;
    createdAt: string;
};

export interface BookingResponse {
    success: boolean;
    message: string;
}

const bookingsCollection = collection(getFirestoreInstance(), 'bookings');


export async function createBooking(
    producer: User | null,
    prevState: BookingResponse,
    formData: FormData
): Promise<BookingResponse> {
    if (!producer) {
        return { success: false, message: 'User information not found. Please log in again.' };
    }

    const date = formData.get('date') as string;
    const providerCompany = formData.get('providerCompany') as string;
    const workOrdersString = formData.get('workOrders') as string;

    if (!date || !providerCompany || !workOrdersString) {
        return { success: false, message: 'Missing required form data.' };
    }
    
    const workOrders = JSON.parse(workOrdersString) as WorkOrder[];
    
    if (workOrders.length === 0) {
        return { success: false, message: 'Please add at least one wine to the booking.' };
    }
    
    for (const wo of workOrders) {
         if (!wo.cultivar || !wo.vintage || !wo.volumeLiters || !wo.bottleType || !wo.closureType || !wo.contactPerson || !wo.contactNumber || !wo.location) {
            return { success: false, message: 'Please fill out all required fields for each wine, including contact and location details.' };
        }
    }

    try {
        const newBookingData: Omit<Booking, 'id'> = {
            date: new Date(date).toISOString(),
            status: 'pending',
            producerCompany: producer.company,
            producerEmail: producer.email,
            providerCompany,
            createdAt: new Date().toISOString(),
            workOrders: workOrders,
        };

        const newBookingRef = await addDoc(bookingsCollection, newBookingData);
        const newBooking = { id: newBookingRef.id, ...newBookingData };

        const serviceProvider = await getUserByCompany(providerCompany);
        if (serviceProvider?.email) {
            await sendBookingRequestEmail(serviceProvider.email, newBooking as Booking);
        } else {
            console.warn(`Could not find email for service provider ${providerCompany}. Skipping notification.`);
        }

        revalidatePath(`/services/book/${providerCompany}`);
        revalidatePath('/bookings/calendar');

        return { success: true, message: 'Your booking request has been submitted!' };

    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function getSupplierBookings(providerCompany: string): Promise<Booking[]> {
    try {
        const q = query(bookingsCollection, where("providerCompany", "==", providerCompany));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toBooking);
    } catch (error) {
        console.error("Error getting supplier bookings:", error);
        return [];
    }
}

export async function getProducerBookings(producerEmail: string, providerCompany?: string): Promise<Booking[]> {
    try {
        let q = query(bookingsCollection, where("producerEmail", "==", producerEmail));
        if (providerCompany) {
            q = query(q, where("providerCompany", "==", providerCompany));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toBooking);
    } catch (error) {
        console.error("Error getting producer bookings:", error);
        return [];
    }
}

export async function updateBookingStatus(
    bookingId: string,
    status: 'confirmed' | 'rejected',
    assignedMachineId?: string
): Promise<BookingResponse> {
    try {
        const firestore = getFirestoreInstance();
        const bookingRef = doc(firestore, 'bookings', bookingId);
        
        const updateData: Partial<Booking> = { status };
        if (status === 'confirmed' && assignedMachineId) {
            updateData.assignedMachineId = assignedMachineId;
        }

        await setDoc(bookingRef, updateData, { merge: true });
        
        const bookingSnap = await getDoc(bookingRef);
        if(bookingSnap.exists()) {
            const booking = toBooking(bookingSnap);
            // Send email notification to producer about the status change
            await sendBookingStatusUpdateEmail(booking, status);
            revalidatePath(`/services/book/${booking.providerCompany}`);
        }
        revalidatePath('/bookings/calendar');
        
        return { success: true, message: `Booking status updated to ${status}.` };

    } catch (error) {
        console.error('Error updating booking status:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}

export async function updateBooking(
    bookingId: string,
    prevState: BookingResponse,
    formData: FormData
): Promise<BookingResponse> {
     try {
        const firestore = getFirestoreInstance();
        const bookingRef = doc(firestore, 'bookings', bookingId);
        
        const rawFormData = {
            date: formData.get('date') as string,
            workOrders: JSON.parse(formData.get('workOrders') as string) as WorkOrder[],
            assignedMachineId: formData.get('assignedMachineId') as string,
        };

         if (!rawFormData.date || !rawFormData.workOrders || rawFormData.workOrders.length === 0) {
            return { success: false, message: 'Please fill out all required fields.' };
        }
        
        const updateData: Partial<Booking> = {
            date: new Date(rawFormData.date).toISOString(),
            workOrders: rawFormData.workOrders,
            assignedMachineId: rawFormData.assignedMachineId || undefined,
        };

        await setDoc(bookingRef, updateData, { merge: true });
        
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
            revalidatePath(`/services/book/${bookingSnap.data().providerCompany}`);
        }
        revalidatePath('/bookings/calendar');

        return { success: true, message: 'Booking updated successfully.' };

     } catch (error) {
        console.error('Error updating booking:', error);
        return { success: false, message: 'An internal server error occurred while updating the booking.' };
     }
}

export async function deleteBooking(
    bookingId: string
): Promise<BookingResponse> {
    try {
        const firestore = getFirestoreInstance();
        const bookingRef = doc(firestore, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
            return { success: false, message: 'Booking not found.' };
        }
        
        const providerCompany = bookingSnap.data().providerCompany;
        await deleteDoc(bookingRef);

        revalidatePath(`/services/book/${providerCompany}`);
        revalidatePath('/bookings/calendar');

        return { success: true, message: 'Booking has been deleted.' };
    } catch (error) {
        console.error('Error deleting booking:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}


export async function createManualBooking(
    prevState: BookingResponse,
    formData: FormData
): Promise<BookingResponse> {
    const providerCompany = cookies().get('userCompany')?.value;
    const providerEmail = cookies().get('userEmail')?.value;
    
    if (!providerCompany || !providerEmail) {
        return { success: false, message: 'User information not found. Please log in again.' };
    }

    const date = formData.get('date') as string;
    const producerCompany = formData.get('producerCompany') as string; // This is now just a text field (Client/Reason)
    const workOrdersString = formData.get('workOrders') as string;
    const assignedMachineId = formData.get('assignedMachineId') as string;

    if (!date || !producerCompany || !workOrdersString) {
        return { success: false, message: 'Missing required form data.' };
    }
    
    const workOrders = JSON.parse(workOrdersString) as WorkOrder[];
    
    try {
        const newBookingData: Omit<Booking, 'id'> = {
            date: new Date(date).toISOString(),
            status: 'confirmed', // Manual entries are always confirmed
            producerCompany: producerCompany,
            producerEmail: 'manual@booking.log', // Placeholder email
            providerCompany,
            createdAt: new Date().toISOString(),
            workOrders: workOrders,
            assignedMachineId: assignedMachineId || undefined,
        };

        await addDoc(bookingsCollection, newBookingData);

        revalidatePath('/bookings/calendar');

        return { success: true, message: 'Your manual booking has been added to the calendar.' };

    } catch (error) {
        console.error('Error creating manual booking:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
