
'use server';

import { collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import type { User } from './users';

type Actor = {
  email: string;
  role: string;
  company: string;
};

type Entity = {
  type: 'USER' | 'ORDER' | 'PRODUCT' | 'BOOKING' | 'PROMOTION' | 'BULK_WINE_LISTING' | 'RFQ' | 'DELIVERY_RECORD' | 'STOCK_ITEM' | 'SAWIS_RETURN';
  id: string;
};

export type AuditLogEvent = {
  id?: string;
  timestamp: string;
  actor: Actor;
  event: 'USER_CREATED' | 'USER_LOGOUT' | 'USER_APPROVED' | 'USER_UPDATED' | 'USER_DELETED' | 'USER_LOGIN' | 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED' | 'ORDER_DELETED' | 'PRODUCT_CREATED' | 'PRODUCT_UPDATED' | 'PRODUCT_DELETED' | 'BOOKING_CREATED' | 'BOOKING_STATUS_CHANGED' | 'BOOKING_DELETED' | 'RFQ_CREATED' | 'QUOTE_SUBMITTED' | 'PROMOTION_CREATED' | 'PROMOTION_DELETED' | 'PROMOTION_FEATURED' | 'DELIVERY_RECORD_CREATED' | 'BULK_LISTING_CREATED' | 'BULK_LISTING_UPDATED' | 'BULK_LISTING_DELETED' | 'STOCK_ADJUSTED' | 'SAWIS_RETURN_SUBMITTED';
  entity: Entity;
  details: {
    summary: string;
    [key: string]: any;
  };
};

const auditLogCollection = collection(getFirestoreInstance(), 'audit-log');
const toAuditLogEvent = (doc: any): AuditLogEvent => ({ id: doc.id, ...doc.data() } as AuditLogEvent);

export async function logAuditEvent(eventData: Omit<AuditLogEvent, 'timestamp'>) {
    try {
        const logEntry: Omit<AuditLogEvent, 'id'> = {
            ...eventData,
            timestamp: new Date().toISOString(),
        };
        await addDoc(auditLogCollection, logEntry);
    } catch (error) {
        console.error("Failed to write to audit log:", error);
        // We don't throw an error here because the primary action should not fail
        // if the logging action fails. We just log it to the server console.
    }
}

export async function getAuditLogs(): Promise<AuditLogEvent[]> {
    try {
        const q = query(auditLogCollection, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toAuditLogEvent);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }
}
