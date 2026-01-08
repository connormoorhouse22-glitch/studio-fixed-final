
'use server';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getStockItems } from '@/lib/stock-actions';
import { AdditionsInventoryList } from './additions-inventory-list';
import { getProducts } from '@/lib/product-actions';
import { getVessels } from '@/lib/cellar-actions';

async function handleStockUpdate() {
    'use server';
    revalidatePath('/cellar-ops/inventory');
}

export default async function AdditionsInventoryPage() {
    const cookieStore = cookies();
    const producerEmail = cookieStore.get('userEmail')?.value;
    const producerCompany = cookieStore.get('userCompany')?.value;

    const allStockItems = producerCompany ? await getStockItems(producerCompany) : [];
    const allProducts = await getProducts();
    const vessels = producerEmail ? await getVessels(producerEmail) : [];

    const wineAdditionCategories = [
        'Yeast', 'Tannins', 'Enzymes', 'Nutrients', 'Bacteria', 'Fining Agents', 
        'Oak Alternatives', 'Preservatives', 'Acids', 'Other Additions'
    ];
    // A bit of a loose check, but should cover most cases
    const wineAdditionKeywords = wineAdditionCategories.map(c => c.toLowerCase());
    
    const additionsInventory = allStockItems.filter(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) return false;
        return wineAdditionKeywords.some(keyword => product.category.toLowerCase().includes(keyword));
    });

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Wine Additions Inventory</h2>
                <p className="text-muted-foreground">
                    Manage stock levels for yeast, tannins, enzymes, and other winemaking additions.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Current Stock</CardTitle>
                        <CardDescription>
                            A real-time overview of your additions. Stock is automatically added when you mark an order as "Delivered".
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <AdditionsInventoryList 
                        initialStock={additionsInventory} 
                        allProducts={allProducts} 
                        vessels={vessels} 
                        onSuccess={handleStockUpdate} 
                    />
                </CardContent>
            </Card>
        </div>
    )
}
