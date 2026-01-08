
'use server';

import { collection, doc, getDocs, getDoc, addDoc, setDoc, query, where, runTransaction, deleteDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import type { Product } from './product-actions';
import { revalidatePath } from 'next/cache';
import type { CartItem } from '@/hooks/use-cart';
import { getUserByEmail, getUserByCompany } from './user-actions';
import { cookies } from 'next/headers';
import { updateStockLevelForOrder } from './stock-actions';
import { logAuditEvent } from './audit-log-actions';
import { sendOrderNotificationEmail } from './email-actions';
import { toOrder } from './firebase-helpers';


export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number; 
};

export type Order = {
    id: string;
    orderNumber: string;
    producerCompany: string;
    producerEmail: string;
    supplierCompany: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'Pending' | 'Order Received' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Quote Request';
    createdAt: string;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    builtProductInfo?: {
        id: string;
        name: string;
    };
    attachment?: string; // For quoted items like labels
};

interface CreateOrderFromCartInput {
    components: CartItem[];
     producer: {
        email: string;
        company: string;
    };
    builtProductInfo?: Order['builtProductInfo'];
}


export interface CreateOrderResponse {
    success: boolean;
    message?: string;
    orders?: (Order & { id: string })[];
    ordersCreated?: number;
}

interface GetOrdersInput {
    userRole: string;
    producerCompany?: string | null;
    supplierCompany?: string | null;
}

export interface CreateOrderForQuoteInput {
    producer: {
        email: string;
        company: string;
    };
    supplierCompany: string;
    itemName: string;
    quantity: number;
    attachmentPath?: string;
    builtProductInfo?: Order['builtProductInfo'];
}

const ordersCollection = collection(getFirestoreInstance(), 'orders');

async function generateNextOrderNumber(): Promise<string> {
    const firestore = getFirestoreInstance();
    const counterRef = doc(firestore, 'counters', 'orders');
    
    try {
        const newCount = await runTransaction(firestore, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists()) {
                // Initialize the counter if it doesn't exist
                transaction.set(counterRef, { count: 1001 });
                return 1001;
            }
            const newCount = counterDoc.data().count + 1;
            transaction.update(counterRef, { count: newCount });
            return newCount;
        });
        return `WS-${newCount}`;
    } catch (error) {
        console.error("Transaction failed: ", error);
        // Fallback to a timestamp-based ID if transaction fails
        return `WS-ERR-${Date.now()}`;
    }
}


export async function createOrdersFromCart(input: CreateOrderFromCartInput): Promise<CreateOrderResponse> {
    const { components, producer, builtProductInfo } = input;
    
    const validComponents = components.filter(c => c.id && c.quantity > 0);

    if (validComponents.length === 0) {
        return { success: true, message: 'No components to order.', orders: [] };
    }

    const ordersBySupplier = new Map<string, OrderItem[]>();
    for (const component of validComponents) {
        if (!ordersBySupplier.has(component.supplier)) {
            ordersBySupplier.set(component.supplier, []);
        }
        ordersBySupplier.get(component.supplier)!.push({
            id: component.id,
            name: component.name,
            price: component.price,
            quantity: component.quantity,
        });
    }

     try {
        const createdOrders: (Order & { id: string })[] = [];
        const producerUser = await getUserByEmail(producer.email);
        if (!producerUser) throw new Error('Producer user not found');

        for (const [supplierCompany, items] of ordersBySupplier.entries()) {
            const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const orderNumber = await generateNextOrderNumber();
            const newOrderData: Omit<Order, 'id'> = {
                orderNumber,
                producerCompany: producer.company,
                producerEmail: producer.email,
                supplierCompany,
                items,
                totalAmount,
                status: 'Pending',
                createdAt: new Date().toISOString(),
                shippedAt: null,
                deliveredAt: null,
            };

            if (builtProductInfo) {
                newOrderData.builtProductInfo = builtProductInfo;
            }

            const newOrderRef = await addDoc(ordersCollection, newOrderData);
            const newOrder = { id: newOrderRef.id, ...newOrderData };
            createdOrders.push(newOrder as Order & { id: string });

            // Log the audit event
            await logAuditEvent({
                actor: { email: producerUser.email, role: producerUser.role, company: producerUser.company },
                event: 'ORDER_CREATED',
                entity: { type: 'ORDER', id: newOrder.orderNumber },
                details: {
                    summary: `${producer.company} placed Order #${newOrder.orderNumber} with ${supplierCompany}.`,
                    totalAmount: newOrder.totalAmount,
                    itemCount: newOrder.items.length,
                }
            });
        }
        
        revalidatePath('/orders');
        revalidatePath('/products/build/completed');
        
        return {
            success: true,
            orders: createdOrders,
            ordersCreated: createdOrders.length
        };
    } catch (error) {
        console.error('Failed to create orders from cart:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred while creating orders.'
        };
    }
}


export async function createOrderForQuote(input: CreateOrderForQuoteInput): Promise<{ success: boolean; orderId?: string; order?: Order & {id: string}, message?: string }> {
    const { producer, supplierCompany, itemName, quantity, attachmentPath, builtProductInfo } = input;
    
    try {
        const orderNumber = await generateNextOrderNumber();
        const newOrderData: Omit<Order, 'id'> = {
            orderNumber,
            producerCompany: producer.company,
            producerEmail: producer.email,
            supplierCompany: supplierCompany,
            items: [{
                id: `quote-${Date.now()}`,
                name: itemName,
                price: 0, 
                quantity: quantity
            }],
            totalAmount: 0,
            status: 'Quote Request',
            createdAt: new Date().toISOString(),
        };

        if (builtProductInfo) {
            newOrderData.builtProductInfo = builtProductInfo;
        }

        if (attachmentPath) {
            newOrderData.attachment = attachmentPath;
        }
        
        const newOrderRef = await addDoc(ordersCollection, newOrderData);
        const newOrder = { id: newOrderRef.id, ...newOrderData };
        
        const producerUser = await getUserByEmail(producer.email);
        if (producerUser) {
            await logAuditEvent({
                actor: { email: producerUser.email, role: producerUser.role, company: producerUser.company },
                event: 'RFQ_CREATED',
                entity: { type: 'ORDER', id: newOrder.orderNumber },
                details: {
                    summary: `${producer.company} sent RFQ #${newOrder.orderNumber} to ${supplierCompany}.`,
                    itemName: itemName,
                }
            });
        }

        revalidatePath('/orders');

        return { success: true, orderId: newOrder.id, order: newOrder as Order & {id: string} };
    } catch (error) {
        console.error('Failed to create order for quote:', error);
        return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred.' };
    }
}

export async function getOrders(filter: GetOrdersInput): Promise<Order[]> {
    const { userRole, producerCompany, supplierCompany } = filter;
    let q;

    try {
        if (userRole === 'Admin') {
            q = query(ordersCollection);
        } else if (userRole === 'Producer' && producerCompany) {
            q = query(ordersCollection, where("producerCompany", "==", producerCompany));
        } else if ((userRole === 'Supplier' || userRole === 'Mobile Service Provider') && supplierCompany) {
            q = query(ordersCollection, where("supplierCompany", "==", supplierCompany));
        } else {
            console.warn("getOrders called with invalid or incomplete filter:", filter);
            return [];
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(toOrder);
    } catch (error) {
        console.error("Error getting orders with filter:", filter, "Error:", error);
        return [];
    }
}


export async function getOrderById(id: string): Promise<Order | undefined> {
    try {
        const firestore = getFirestoreInstance();
        const orderRef = doc(firestore, 'orders', id);
        const docSnap = await getDoc(orderRef);
        return docSnap.exists() ? toOrder(docSnap) : undefined;
    } catch (error) {
        console.error(`Error getting order by id ${id}:`, error);
        return undefined;
    }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; message?: string }> {
    try {
        const cookieStore = cookies();
        const actorEmail = cookieStore.get('userEmail')?.value;
        const actorRole = cookieStore.get('userRole')?.value;
        const actorCompany = cookieStore.get('userCompany')?.value;

        if (!actorEmail || !actorRole || !actorCompany) {
            return { success: false, message: 'Could not identify acting user.' };
        }

        const firestore = getFirestoreInstance();
        const orderRef = doc(firestore, 'orders', orderId);
        const updateData: Partial<Order> = { status };
        
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) {
            return { success: false, message: 'Order not found.' };
        }
        const order = toOrder(orderSnap);
        const oldStatus = order.status;

        if (status === 'Shipped') {
            updateData.shippedAt = new Date().toISOString();
        } else if (status === 'Delivered') {
            updateData.deliveredAt = new Date().toISOString();
            
            // Add items to stock
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    await updateStockLevelForOrder(order.producerCompany, item.id, item.quantity, order.id);
                }
            }
        }
        
        await setDoc(orderRef, updateData, { merge: true });

        // Log the audit event for status change
        await logAuditEvent({
            actor: { email: actorEmail, role: actorRole, company: actorCompany },
            event: 'ORDER_STATUS_CHANGED',
            entity: { type: 'ORDER', id: order.orderNumber },
            details: {
                summary: `${actorCompany} updated Order #${order.orderNumber} status from '${oldStatus}' to '${status}'.`,
                fromStatus: oldStatus,
                toStatus: status,
            }
        });

        revalidatePath('/orders');
        revalidatePath('/suppliers/orders');
        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/admin/all-orders');
        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred.' };
    }
}

export async function deleteOrder(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
    const cookieStore = cookies();
    const userRole = cookieStore.get('userRole')?.value;
    const actorEmail = cookieStore.get('userEmail')?.value;
    const actorCompany = cookieStore.get('userCompany')?.value;


  if (userRole !== 'Admin') {
    return { success: false, message: 'You are not authorized to delete orders.' };
  }

  if (!orderId) {
    return { success: false, message: 'Order ID is missing.' };
  }

  try {
    const firestore = getFirestoreInstance();
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
        return { success: false, message: 'Order not found.' };
    }
    const order = toOrder(orderSnap);
    
    await deleteDoc(orderRef);

    // Log the audit event for deletion
    await logAuditEvent({
        actor: { email: actorEmail!, role: userRole, company: actorCompany! },
        event: 'ORDER_DELETED',
        entity: { type: 'ORDER', id: order.orderNumber },
        details: {
            summary: `Admin (${actorEmail}) deleted Order #${order.orderNumber}.`
        }
    });

    revalidatePath('/admin/all-orders');
    return { success: true, message: 'Order deleted successfully.' };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, message: 'An internal server error occurred.' };
  }
}


export async function confirmDelivery(prevState: { message: string; success: boolean }, formData: FormData): Promise<{ message: string; success: boolean }> {
  const orderId = formData.get('orderId') as string;
  if (!orderId) {
    return { success: false, message: 'Order ID is missing.' };
  }
  
  try {
    const result = await updateOrderStatus(orderId, 'Delivered');
    if (result.success) {
      revalidatePath('/orders');
      revalidatePath('/admin/all-orders');
      return { success: true, message: 'Delivery confirmed successfully.' };
    } else {
      return { success: false, message: result.message || 'Failed to confirm delivery.' };
    }
  } catch (error) {
    console.error('Error confirming delivery:', error);
    return { success: false, message: 'An internal server error occurred.' };
  }
}

export async function createQuoteForCork(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const producerEmail = cookieStore.get('userEmail')?.value;
  const producerCompany = cookieStore.get('userCompany')?.value;

  if (!producerEmail || !producerCompany) {
    return { success: false, message: 'User not found. Please log in again.' };
  }

  const productId = formData.get('productId') as string;
  const productName = formData.get('productName') as string;
  const supplier = formData.get('supplier') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const vintage = formData.get('corkVintage') as string;
  const vintageInCircle = formData.get('corkVintageInCircle') as string;
  const artwork = formData.get('artworkProof') as File;

  if (!productId || !artwork || artwork.size === 0) {
    return { success: false, message: 'Product selection and artwork file are required.' };
  }

  let attachmentPath: string | undefined;

  const uploadsDirPath = require('path').join(process.cwd(), 'public/uploads');
  const fs = require('fs').promises;
  
  try {
    await fs.mkdir(uploadsDirPath, { recursive: true });
    const fileName = `${Date.now()}-${artwork.name}`;
    attachmentPath = `/uploads/${fileName}`;
    await fs.writeFile(require('path').join(process.cwd(), `public${attachmentPath}`), Buffer.from(await artwork.arrayBuffer()));
  } catch (error) {
    console.error('Error saving artwork file:', error);
    return { success: false, message: 'Failed to save artwork file.' };
  }

  const itemName = `Custom Artwork for: ${productName} (Vintage: ${vintage}, In Circle: ${vintageInCircle})`;

  await createOrderForQuote({
    producer: { email: producerEmail, company: producerCompany },
    supplierCompany: supplier,
    itemName,
    quantity,
    attachmentPath,
  });

  revalidatePath('/orders');
  return { success: true, message: 'Your quote request for custom corks has been submitted!' };
}
