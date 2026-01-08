
'use server';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { InventoryList } from './inventory-list';
import { AddStockItemDialog } from './add-stock-item-dialog';
import { revalidatePath } from 'next/cache';

async function handleStockUpdate() {
    'use server';
    revalidatePath('/inventory');
}

export default async function InventoryPage() {

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Dry Goods Inventory</h2>
                <p className="text-muted-foreground">
                    Manage your stock levels for bottles, corks, labels, and other dry goods.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Current Stock</CardTitle>
                        <CardDescription>
                            A real-time overview of your inventory. Stock is automatically added when you mark an order as "Delivered".
                        </CardDescription>
                    </div>
                    <AddStockItemDialog onSuccess={handleStockUpdate} />
                </CardHeader>
                <CardContent>
                    <InventoryList />
                </CardContent>
            </Card>
        </div>
    )
}
