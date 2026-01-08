
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FlaskConical, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type StockItem } from '@/lib/stock-actions';
import { type Product } from '@/lib/product-actions';
import { type WineryVessel } from '@/lib/cellar-actions';
import { Badge } from '@/components/ui/badge';
import { LogAdditionDialog } from './log-addition-dialog';

interface AdditionsInventoryListProps {
    initialStock: StockItem[];
    allProducts: Product[];
    vessels: WineryVessel[];
    onSuccess: () => void;
}

export function AdditionsInventoryList({ initialStock, allProducts, vessels, onSuccess }: AdditionsInventoryListProps) {

    if (initialStock.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-10">
                <FlaskConical className="mx-auto h-12 w-12" />
                <p className="mt-4">Your wine additions inventory is empty.</p>
                <p className="text-sm">Stock will appear here when you mark an order for wine additions as "Delivered".</p>
            </div>
        );
    }

    return (
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
                {initialStock.map(item => {
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
                                <LogAdditionDialog 
                                    stockItem={item} 
                                    vessels={vessels} 
                                    onSuccess={onSuccess} 
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem disabled>Set Low Stock Alert</DropdownMenuItem>
                                        <DropdownMenuItem disabled>View History</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                     )
                })}
            </TableBody>
        </Table>
    );
}
