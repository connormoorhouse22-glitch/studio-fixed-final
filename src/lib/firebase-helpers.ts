
// DO NOT 'use server' in this file. It should remain a client-and-server-safe helper file.

import type { User } from './users';
import type { Order } from './order-actions';
import type { Product } from './product-actions';
import type { Promotion } from './promotion-actions';
import type { RFQ } from './quote-actions';
import type { DiaryEntry } from './diary-actions';
import type { StockItem, StockLog } from './stock-actions';
import type { BulkWineListing } from './bulk-wine-actions';
import type { Machine } from './machine-actions';
import type { Booking, WorkOrder } from './booking-actions';
import type { DeliveryRecord } from './delivery-record-actions';
import type { Offender } from './offender-actions';
import type { SawisReturn } from './sawis-actions';
import type { WineryVessel, CellarLogEntry } from './cellar-actions';


// This file centralizes Firestore data conversion functions to prevent circular dependencies.

export const toUser = (doc: any): User => {
    const data = doc.data();
    if (data.lastSeen && typeof data.lastSeen.toDate === 'function') {
        data.lastSeen = data.lastSeen.toDate().toISOString();
    }
    if (!data.pricingTiers) {
        data.pricingTiers = { default: 'Tier 1' };
    }
    return { id: doc.id, ...data } as User;
}

export const toOrder = (doc: any): Order => ({ id: doc.id, ...doc.data() } as Order);

export const toProduct = (doc: any): Product => ({ id: doc.id, ...doc.data() } as Product);

export const toPromotion = (doc: any): Promotion => ({ id: doc.id, ...doc.data() } as Promotion);

export const toRFQ = (doc: any): RFQ => ({ id: doc.id, ...doc.data() } as RFQ);

export const toDiaryEntry = (doc: any): DiaryEntry => ({ id: doc.id, ...doc.data() } as DiaryEntry);

export const toStockItem = (doc: any): StockItem => ({ id: doc.id, ...doc.data() } as StockItem);

export const toStockLog = (doc: any): StockLog => ({ id: doc.id, ...doc.data() } as StockLog);

export const toBulkWineListing = (doc: any): BulkWineListing => ({ id: doc.id, ...doc.data() } as BulkWineListing);

export const toMachine = (doc: any): Machine => ({ id: doc.id, ...doc.data() } as Machine);

export const toBooking = (doc: any): Booking => ({ id: doc.id, ...doc.data() } as Booking);

export const toDeliveryRecord = (doc: any): DeliveryRecord => ({ id: doc.id, ...doc.data() } as DeliveryRecord);

export const toOffender = (doc: any): Offender => ({ id: doc.id, ...doc.data() } as Offender);

export const toSawisReturn = (doc: any): SawisReturn => ({ id: doc.id, ...doc.data() } as SawisReturn);

export const toVessel = (doc: any): WineryVessel => ({ id: doc.id, ...doc.data() } as WineryVessel);

export const toCellarLog = (doc: any): CellarLogEntry => ({ id: doc.id, ...doc.data() } as CellarLogEntry);
