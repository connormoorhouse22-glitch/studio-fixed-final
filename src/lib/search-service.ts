
'use server';

import { cookies } from 'next/headers';
import { getBulkWineListings, type BulkWineListing } from './bulk-wine-actions';
import { getOrders, type Order } from './order-actions';
import { getProducts, type Product } from './product-actions';
import { getUsers, type User } from './userActions';

export interface SearchableData {
  products: Product[];
  users: User[];
  orders: Order[];
  bulkListings: BulkWineListing[];
}

export async function getSearchableData(): Promise<SearchableData> {
    const cookieStore = cookies();
    const userRole = cookieStore.get('userRole')?.value;
    const userEmail = cookieStore.get('userEmail')?.value;
    const userCompany = cookieStore.get('userCompany')?.value;

    const [allProducts, allUsers, allOrders, allBulkListings] = await Promise.all([
        getProducts(),
        getUsers(),
        getOrders({ userRole: 'Admin' }), // Fetch all orders for potential filtering
        getBulkWineListings(),
    ]);

    if (!userRole) {
        return { products: [], users: [], orders: [], bulkListings: [] };
    }

    if (userRole === 'Admin') {
        return {
            products: allProducts,
            users: allUsers,
            orders: allOrders,
            bulkListings: allBulkListings,
        };
    }

    if (userRole === 'Producer') {
        return {
            products: allProducts, // Producers can see all products
            users: allUsers.filter(u => u.role === 'Supplier' || u.role === 'Mobile Service Provider'),
            orders: allOrders.filter(o => o.producerEmail === userEmail),
            bulkListings: allBulkListings,
        };
    }

    if (userRole === 'Supplier' || userRole === 'Mobile Service Provider') {
        return {
            products: allProducts.filter(p => p.supplier === userCompany),
            users: allUsers.filter(u => u.role === 'Producer'),
            orders: allOrders.filter(o => o.supplierCompany === userCompany),
            bulkListings: [], // Suppliers don't see the bulk wine market
        };
    }

    // Default empty state for any other case
    return { products: [], users: [], orders: [], bulkListings: [] };
}
