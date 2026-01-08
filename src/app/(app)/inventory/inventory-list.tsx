
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, AlertCircle, Package } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getStockItems, type StockItem } from '@/lib/stock-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { SetThresholdDialog } from './set-threshold-dialog';
import { ViewHistoryDialog } from './view-history-dialog';

function InventoryListSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-12 w-12" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
            ))}
        </div>
    )
}

export function InventoryList() {
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStock = useCallback(async () => {
        setIsLoading(true);
        const company = localStorage.getItem('userCompany');
        if (company) {
            const items = await getStockItems(company);
            setStockItems(items);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    const handleActionSuccess = () => {
        fetchStock();
    };

    if (isLoading) {
        return <InventoryListSkeleton />;
    }

    return (
        <div>
            {stockItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    <Package className="mx-auto h-12 w-12" />
                    <p className="mt-4">Your inventory is empty.</p>
                    <p className="text-sm">Stock will automatically appear here when you mark an order as "Delivered".</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-right">Quantity on Hand</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stockItems.map(item => {
                             const isLowStock = item.lowStockThreshold && item.quantity < item.lowStockThreshold;
                             return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell>{item.supplier}</TableCell>
                                <TableCell className="text-right font-mono">
                                    <div className="flex items-center justify-end gap-2">
                                    {isLowStock && <AlertCircle className="h-4 w-4 text-destructive" />}
                                     <Badge variant={isLowStock ? "destructive" : "secondary"}>
                                        {item.quantity.toLocaleString('en-US')}
                                     </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <AdjustStockDialog stockItem={item} onSuccess={handleActionSuccess} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <SetThresholdDialog stockItem={item} onSuccess={handleActionSuccess} />
                                            <ViewHistoryDialog stockItemId={item.id} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
