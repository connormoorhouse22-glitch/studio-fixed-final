
'use server';

import { collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import type { ScrapedProduct } from '@/ai/flows/catalog-importer-flow';
import { toProduct } from './firebase-helpers';

export type Product = {
  id: string;
  name: string;
  price: number;
  priceTier2?: number;
  priceTier3?: number;
  priceTier4?: number;
  priceTier5?: number;
  priceTier6?: number;
  description: string;
  image: string;
  category: string;
  subCategory?: string;
  supplier: string;
  aiHint: string;
  stockOnHand?: number;
  unitsPerPallet?: number;
  labelSize?: string;
  labelText?: string;
};

export interface ProductUpdateResponse {
  message: string;
}

const productsCollection = collection(getFirestoreInstance(), 'products');

export async function getProducts(supplierName?: string): Promise<Product[]> {
    try {
        let q = query(productsCollection);

        if (supplierName) {
            q = query(productsCollection, where("supplier", "==", supplierName));
        }
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(toProduct);

    } catch (error) {
        console.error("Error getting products:", error);
        return [];
    }
}

export async function getProductById(id: string): Promise<Product | undefined> {
    try {
        const firestore = getFirestoreInstance();
        const docRef = doc(firestore, 'products', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return undefined;
        }
        return toProduct(docSnap);
    } catch (error) {
        console.error(`Error getting product by id ${id}:`, error);
        return undefined;
    }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<void> {
    try {
        const productData = { ...product };

        // Ensure optional price tiers are numbers or undefined
        for (let i = 2; i <= 6; i++) {
            const tierKey = `priceTier${'i'}` as keyof Product;
            const value = (productData as any)[tierKey];
            if (value === '' || value === null || typeof value === 'undefined' || isNaN(Number(value))) {
                 delete (productData as any)[tierKey];
            } else {
                (productData as any)[tierKey] = Number(value);
            }
        }
        
        await addDoc(productsCollection, productData);
        revalidatePath('/products/manage');
    } catch (error) {
        console.error("Error adding product:", error);
    }
}

export async function addMultipleProducts(productsToImport: ScrapedProduct[]): Promise<{ success: boolean; importedCount?: number; message?: string }> {
    if (!Array.isArray(productsToImport) || productsToImport.length === 0) {
        return { success: false, message: 'No products provided for import.' };
    }
    
    try {
        const firestore = getFirestoreInstance();
        const batch = writeBatch(firestore);
        let importedCount = 0;

        for (const productData of productsToImport) {
            if (!productData.name || !productData.category) {
                console.warn('Skipping product with no name or category:', productData);
                continue;
            }
            
            const newProductRef = doc(productsCollection);
            const newProduct: Omit<Product, 'id'> = {
                name: productData.name,
                price: productData.price || 0,
                description: productData.description || 'No description provided.',
                category: productData.category,
                supplier: productData.supplier || 'Unknown Supplier',
                aiHint: productData.aiHint || 'product image',
                image: productData.imageUrl || `https://picsum.photos/seed/${Math.random()}/600/400`,
            };
            batch.set(newProductRef, newProduct);
            importedCount++;
        }
        await batch.commit();
        revalidatePath('/'); // Revalidate all paths as products could appear anywhere
        return { success: true, importedCount };
    } catch (error) {
        console.error('Failed to import products:', error);
        return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred during import.' };
    }
}


export async function updateProduct(id: string, prevState: { message: string }, formData: FormData): Promise<ProductUpdateResponse> {
    try {
        const firestore = getFirestoreInstance();
        const productRef = doc(firestore, 'products', id);

        const getNumericValue = (value: string | null) => {
            if (value === null || value.trim() === '') {
                return undefined;
            }
            const num = parseFloat(value);
            return isNaN(num) ? undefined : num;
        };
        
        const updateData: Partial<Product> & { [key: string]: any } = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: getNumericValue(formData.get('price') as string) ?? 0,
            priceTier2: getNumericValue(formData.get('priceTier2') as string),
            priceTier3: getNumericValue(formData.get('priceTier3') as string),
            priceTier4: getNumericValue(formData.get('priceTier4') as string),
            priceTier5: getNumericValue(formData.get('priceTier5') as string),
            priceTier6: getNumericValue(formData.get('priceTier6') as string),
            category: formData.get('category') as Product['category'],
            subCategory: (formData.get('subCategory') as Product['subCategory']) || '',
            image: formData.get('image') as string,
            aiHint: formData.get('aiHint') as string,
            stockOnHand: getNumericValue(formData.get('stockOnHand') as string),
            unitsPerPallet: getNumericValue(formData.get('unitsPerPallet') as string),
            labelSize: (formData.get('labelSize') as string) || '',
            labelText: (formData.get('labelText') as string) || '',
        };

        // Clean up undefined values so Firestore can remove them
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        await setDoc(productRef, updateData, { merge: true });

        revalidatePath('/products/manage');
        revalidatePath(`/`);
        
        return { message: 'Success' };

    } catch (e) {
        console.error("Error updating product:", e);
        return { message: 'Failed to update product.' };
    }
}


export async function deleteProduct(id: string, prevState: { message: string }, formData: FormData) {
    try {
      const firestore = getFirestoreInstance();
      const productRef = doc(firestore, 'products', id);
      await deleteDoc(productRef);
      revalidatePath('/products/manage');
      return { message: 'Success' };
    } catch (e) {
      console.error("Error deleting product:", e);
      return { message: 'Failed to delete product' };
    }
}

export async function duplicateProduct(id: string): Promise<{ success: boolean; message?: string }> {
    try {
        const productToDuplicate = await getProductById(id);

        if (!productToDuplicate) {
            return { success: false, message: 'Product not found.' };
        }

        const { id: oldId, name, ...restOfProduct } = productToDuplicate;
        const newProductData: Omit<Product, 'id'> = {
            ...restOfProduct,
            name: `${name} (Copy)`,
        };

        await addDoc(productsCollection, newProductData);
        revalidatePath('/products/manage');

        return { success: true };
    } catch (error) {
        console.error('Failed to duplicate product:', error);
        return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred.' };
    }
}
