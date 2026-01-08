
'use server';

import { collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import type { Product } from './product-actions';
import { revalidatePath } from 'next/cache';
import { createOrdersFromCart, createOrderForQuote, type Order } from './order-actions';
import type { CartItem } from '@/hooks/use-cart';
import { cookies } from 'next/headers';
import { getUserByEmail, getUserByCompany } from './user-actions';

export type BuiltProduct = {
  id: string;
  brand: string;
  range: string;
  cultivar: string;
  vintage: string;
  components: CartItem[];
  totalCost: number;
  createdAt: string;
  createdBy: string;
  labelProofPath?: string;
  labelSuppliers?: string[];
  cartonProofPath?: string;
  cartonSuppliers?: string[];
  corkProofPath?: string;
  corkVintage?: string;
  corkVintageInCircle?: 'Yes' | 'No' | '';
  screwcapProofPath?: string;
  capsuleProofPath?: string;
};

export interface UpdateBuiltProductResponse {
  message: string;
}

export interface SaveAndOrderResponse {
    success: boolean;
    message?: string;
    builtProductId?: string;
    ordersCreated?: number;
}

const builtProductsCollection = collection(getFirestoreInstance(), 'builtProducts');
const toBuiltProduct = (doc: any): BuiltProduct => ({ id: doc.id, ...doc.data() } as BuiltProduct);


export async function saveBuiltProduct(
    prevState: SaveAndOrderResponse,
    formData: FormData
): Promise<SaveAndOrderResponse> {
    const userEmail = formData.get('userEmail') as string | null;
    if (!userEmail) {
        return { success: false, message: 'Authentication error. Please log in again.' };
    }

    try {
        const uploadsDirPath = require('path').join(process.cwd(), 'public/uploads');
        const fs = require('fs').promises;
        await fs.mkdir(uploadsDirPath, { recursive: true });

        const brand = formData.get('brand') as string;
        const range = formData.get('range') as string;
        const cultivar = formData.get('cultivar') as string;
        const vintage = formData.get('vintage') as string;
        
        const labelProof = formData.get('labelProof') as File | null;
        const labelSuppliers = [
            formData.get('labelSupplier1') as string,
            formData.get('labelSupplier2') as string,
            formData.get('labelSupplier3') as string,
        ].filter(Boolean); // Filter out empty/null values

        const cartonProof = formData.get('cartonProof') as File | null;
        const cartonSuppliers = [
            formData.get('cartonSupplier1') as string,
            formData.get('cartonSupplier2') as string,
            formData.get('cartonSupplier3') as string,
        ].filter(Boolean);


        const corkProof = formData.get('corkProof') as File | null;
        const corkVintage = formData.get('corkVintage') as string;
        const corkVintageInCircle = formData.get('corkVintageInCircle') as BuiltProduct['corkVintageInCircle'];
        const screwcapProof = formData.get('screwcapProof') as File | null;
        const capsuleProof = formData.get('capsuleProof') as File | null;
        const bomComponentsString = formData.get('bomComponents') as string;
        const bomComponents = JSON.parse(bomComponentsString) as CartItem[];

        if (!brand || !range || !cultivar || !vintage) {
            return { success: false, message: 'Please fill in all product details (Brand, Range, Cultivar, Vintage).' };
        }
        if (bomComponents.length === 0 && !labelProof && !cartonProof && !corkProof && !screwcapProof && !capsuleProof) {
            return { success: false, message: 'Please select at least one component or upload a proof to build a product.' };
        }
        if (labelProof && labelProof.size > 0 && labelSuppliers.length === 0) {
            return { success: false, message: 'Please select at least one supplier for your label quote request.' };
        }
        if (corkProof && corkProof.size > 0 && (!corkVintage || !corkVintageInCircle)) {
            return { success: false, message: 'Please provide the Vintage and "Vintage in Circle" selection for your cork artwork.' };
        }

        const bomTotalCost = bomComponents.reduce((acc, curr) => acc + (curr?.price || 0) * curr.quantity, 0);
        
        const newProductData: Omit<BuiltProduct, 'id'> = {
            brand,
            range,
            cultivar,
            vintage,
            totalCost: bomTotalCost,
            createdBy: userEmail,
            components: bomComponents,
            createdAt: new Date().toISOString(),
        };
        
        if (labelProof && labelProof.size > 0) {
            const labelBuffer = Buffer.from(await labelProof.arrayBuffer());
            const labelFileName = `${Date.now()}-${labelProof.name}`;
            const labelFilePath = `/uploads/${labelFileName}`;
            await fs.writeFile(require('path').join(uploadsDirPath, labelFileName), labelBuffer);
            newProductData.labelProofPath = labelFilePath;
            newProductData.labelSuppliers = labelSuppliers;
        }
        if (cartonProof && cartonProof.size > 0) {
            const cartonBuffer = Buffer.from(await cartonProof.arrayBuffer());
            const cartonFileName = `${Date.now()}-${cartonProof.name}`;
            const cartonFilePath = `/uploads/${cartonFileName}`;
            await fs.writeFile(require('path').join(uploadsDirPath, cartonFileName), cartonBuffer);
            newProductData.cartonProofPath = cartonFilePath;
            newProductData.cartonSuppliers = cartonSuppliers;
        }
         if (corkProof && corkProof.size > 0) {
            const corkBuffer = Buffer.from(await corkProof.arrayBuffer());
            const corkFileName = `${Date.now()}-${corkProof.name}`;
            const corkFilePath = `/uploads/${corkFileName}`;
            await fs.writeFile(require('path').join(uploadsDirPath, corkFileName), corkBuffer);
            newProductData.corkProofPath = corkFilePath;
            newProductData.corkVintage = corkVintage;
            newProductData.corkVintageInCircle = corkVintageInCircle;
        }
        if (screwcapProof && screwcapProof.size > 0) {
            const screwcapBuffer = Buffer.from(await screwcapProof.arrayBuffer());
            const screwcapFileName = `${Date.now()}-${screwcapProof.name}`;
            const screwcapFilePath = `/uploads/${screwcapFileName}`;
            await fs.writeFile(require('path').join(uploadsDirPath, screwcapFileName), screwcapBuffer);
            newProductData.screwcapProofPath = screwcapFilePath;
        }
        if (capsuleProof && capsuleProof.size > 0) {
            const capsuleBuffer = Buffer.from(await capsuleProof.arrayBuffer());
            const capsuleFileName = `${Date.now()}-${capsuleProof.name}`;
            const capsuleFilePath = `/uploads/${capsuleFileName}`;
            await fs.writeFile(require('path').join(uploadsDirPath, capsuleFileName), capsuleBuffer);
            newProductData.capsuleProofPath = capsuleFilePath;
        }

        const newDocRef = await addDoc(builtProductsCollection, newProductData);

        revalidatePath('/products/build/completed');
        
        return {
            success: true,
            builtProductId: newDocRef.id,
            message: `Successfully created and saved your new product configuration: ${brand} ${range}.`
        };
        
    } catch (error) {
        console.error('Error in saveBuiltProduct:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An unknown error occurred.',
        }
    }
}


export async function getBuiltProducts(userEmail?: string): Promise<BuiltProduct[]> {
    try {
        let q = query(builtProductsCollection);
        if (userEmail) {
            q = query(builtProductsCollection, where("createdBy", "==", userEmail));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toBuiltProduct);
    } catch (error) {
        console.error("Error getting built products:", error);
        return [];
    }
}

export async function updateBuiltProduct(id: string, prevState: { message: string }, formData: FormData): Promise<UpdateBuiltProductResponse> {
    try {
        const firestore = getFirestoreInstance();
        const productRef = doc(firestore, 'builtProducts', id);
        
        const updateData: Partial<BuiltProduct> & { [key: string]: any } = {
            brand: formData.get('brand') as string,
            range: formData.get('range') as string,
            cultivar: formData.get('cultivar') as string,
            vintage: formData.get('vintage') as string,
            components: JSON.parse(formData.get('components') as string) as CartItem[],
        };
        updateData.totalCost = updateData.components!.reduce((acc, curr) => acc + (curr?.price || 0), 0);
        
        if (formData.get('removeLabelProof') === 'true') {
            updateData.labelProofPath = undefined;
            updateData.labelSuppliers = undefined;
        }
        if (formData.get('removeCartonProof') === 'true') {
            updateData.cartonProofPath = undefined;
            updateData.cartonSuppliers = undefined;
        }

        // Clean up undefined values so they are removed from Firestore document
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        await setDoc(productRef, updateData, { merge: true });

        revalidatePath('/products/build/completed');
        return { message: 'Success' };

    } catch (e) {
        console.error("Error updating built product:", e);
        return { message: 'Failed to update product.' };
    }
}


export async function deleteBuiltProduct(id: string, prevState: { message: string }, formData: FormData) {
    try {
      const firestore = getFirestoreInstance();
      const productRef = doc(firestore, 'builtProducts', id);
      await deleteDoc(productRef);
      revalidatePath('/products/build/completed');
      return { message: 'Success' };
    } catch (e) {
      console.error("Error deleting built product:", e);
      return { message: 'Failed to delete product' };
    }
}


export async function createOrdersForBuiltProduct(
  producer: { email: string; company: string } | null,
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const builtProductId = formData.get('builtProductId') as string;
  const productionQuantity = parseInt(formData.get('quantity') as string, 10);
  
  if (!producer || !producer.email || !producer.company) {
    return { success: false, message: 'Authentication error. Please log in again.' };
  }
  
  if (!builtProductId || isNaN(productionQuantity) || productionQuantity <= 0) {
    return { success: false, message: 'Invalid product ID or quantity.' };
  }

  try {
    const firestore = getFirestoreInstance();
    const builtProductDoc = await getDoc(doc(firestore, 'builtProducts', builtProductId));
    if (!builtProductDoc.exists()) {
        return { success: false, message: 'Built product not found.' };
    }
    const builtProduct = toBuiltProduct(builtProductDoc);
    
    // This needs to be a dynamic import inside the action to avoid circular dependencies at the module level.
    const { sendOrderNotificationEmail } = await import('@/lib/email-actions');

    const orderComponents: CartItem[] = [];

    for (const component of builtProduct.components) {
        const isBottle = component.category === 'Bottles' || component.category === 'Bordeaux' || component.category === 'Burgundy' || component.category === 'Flute Hock';
        const isScrewcap = component.category === 'Screwcaps';
        const isCork = component.category === 'Corks';
        let requiredQuantity = 0;

        if (isBottle && component.unitsPerPallet && component.unitsPerPallet > 0) {
            const palletsNeeded = Math.ceil(productionQuantity / component.unitsPerPallet);
            requiredQuantity = palletsNeeded * component.unitsPerPallet;
        } else if (isScrewcap || isCork) {
            const boxesNeeded = Math.ceil(productionQuantity / 1000);
            requiredQuantity = boxesNeeded * 1000;
        } else {
            requiredQuantity = productionQuantity;
        }
        
        orderComponents.push({ ...component, quantity: requiredQuantity });
    }

    const createdOrderIds = [];
    const producerUser = await getUserByEmail(producer.email);


    const processAndSendEmailForQuote = async (
        supplierCompany: string,
        itemName: string,
        quantity: number,
        attachmentPath: string,
        builtProductInfo: any
    ) => {
        const result = await createOrderForQuote({ producer, supplierCompany, itemName, quantity, attachmentPath, builtProductInfo });
        if (result.success && result.order) {
            createdOrderIds.push(result.order.id);
            
            const supplierUser = await getUserByCompany(supplierCompany);
            const preferredContacts = producerUser?.preferredSupplierContacts?.[supplierCompany] || [];
            let recipientEmails = preferredContacts.filter(c => c && c !== 'none');
            if (recipientEmails.length === 0 && supplierUser?.email) {
                recipientEmails.push(supplierUser.email);
            }
            
            const attachmentBuffer = Buffer.from(await (await fetch(process.env.NEXT_PUBLIC_BASE_URL + attachmentPath)).arrayBuffer());
            for (const email of recipientEmails) {
                await sendOrderNotificationEmail(email, result.order, { filename: attachmentPath.split('/').pop()!, content: attachmentBuffer });
            }
        }
    };


    if (builtProduct.labelSuppliers && builtProduct.labelSuppliers.length > 0 && builtProduct.labelProofPath) {
       for (const supplier of builtProduct.labelSuppliers) {
            await processAndSendEmailForQuote(
                supplier,
                `Custom Label Quote for: ${builtProduct.brand} ${builtProduct.range}`,
                productionQuantity,
                builtProduct.labelProofPath,
                { id: builtProduct.id, name: `${builtProduct.brand} - ${builtProduct.range}` }
            );
       }
    }
    
    if (builtProduct.cartonSuppliers && builtProduct.cartonSuppliers.length > 0 && builtProduct.cartonProofPath) {
        const cartonsNeeded = Math.ceil(productionQuantity / 12);
        for (const supplier of builtProduct.cartonSuppliers) {
            await processAndSendEmailForQuote(
                supplier,
                `Custom Carton Quote for: ${builtProduct.brand} ${builtProduct.range}`,
                cartonsNeeded,
                builtProduct.cartonProofPath,
                { id: builtProduct.id, name: `${builtProduct.brand} - ${builtProduct.range}` }
            );
        }
    }


    if (builtProduct.corkProofPath) {
      const baseCorkProduct = builtProduct.components.find(c => c.category === 'Corks');
      const corkPrintSupplier = baseCorkProduct?.supplier || 'RX Corks';
      await processAndSendEmailForQuote(
          corkPrintSupplier,
          `Custom Cork Artwork Printing for: ${builtProduct.brand} ${builtProduct.range}. Vintage: ${builtProduct.corkVintage}. Circle: ${builtProduct.corkVintageInCircle}`,
          productionQuantity,
          builtProduct.corkProofPath,
          { id: builtProduct.id, name: `${builtProduct.brand} - ${builtProduct.range}` }
      );
    }
    
    if (builtProduct.screwcapProofPath) {
        const baseScrewcapProduct = builtProduct.components.find(c => c.category === 'Screwcaps');
        const screwcapPrintSupplier = baseScrewcapProduct?.supplier || 'Guala Closures';
        await processAndSendEmailForQuote(
            screwcapPrintSupplier,
            `Custom Screwcap Quote for: ${builtProduct.brand} ${builtProduct.range}`,
            productionQuantity,
            builtProduct.screwcapProofPath,
            { id: builtProduct.id, name: `${builtProduct.brand} - ${builtProduct.range}` }
        );
    }
    
    if (builtProduct.capsuleProofPath) {
        const baseCapsuleProduct = builtProduct.components.find(c => c.category.includes('Capsule'));
        const capsulePrintSupplier = baseCapsuleProduct?.supplier || 'ACS';
        await processAndSendEmailForQuote(
            capsulePrintSupplier,
            `Custom Capsule Quote for: ${builtProduct.brand} ${builtProduct.range}`,
            productionQuantity,
            builtProduct.capsuleProofPath,
            { id: builtProduct.id, name: `${builtProduct.brand} - ${builtProduct.range}` }
        );
    }


    const result = await createOrdersFromCart({
      components: orderComponents,
      producer: { email: producer.email, company: producer.company },
      builtProductInfo: { id: builtProduct.id, name: `${builtProduct.brand} - ${builtProduct.range}` }
    });

    if (result.success && result.orders) {
      // Send emails for the component orders
      for (const order of result.orders) {
          const supplierUser = await getUserByCompany(order.supplierCompany);
          const preferredContacts = producerUser?.preferredSupplierContacts?.[order.supplierCompany] || [];
          let recipientEmails = preferredContacts.filter(c => c && c !== 'none');

          if (recipientEmails.length === 0 && supplierUser?.email) {
              recipientEmails.push(supplierUser.email);
          }

          for (const email of recipientEmails) {
              await sendOrderNotificationEmail(email, order);
          }
      }

      revalidatePath('/orders');
      const totalOrders = (result.orders?.length || 0) + createdOrderIds.length;
      return { success: true, message: `${totalOrders} order(s) and quote requests placed successfully.` };
    } else {
      throw new Error(result.message || 'Failed to create orders.');
    }

  } catch (error) {
    console.error('Error creating orders for built product:', error);
    return { success: false, message: error instanceof Error ? error.message : 'An internal server error occurred.' };
  }
}
