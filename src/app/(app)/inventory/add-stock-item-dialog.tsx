
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createStockItem, type StockActionResponse } from '@/lib/stock-actions';
import { getProducts, type Product } from '@/lib/product-actions';
import { ProductSelector, type SelectedProduct } from '@/components/product-selector';
import { Loader2, PlusCircle } from 'lucide-react';

const initialState: StockActionResponse = { success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add to Inventory'}
        </Button>
    )
}

interface AddStockItemDialogProps {
    onSuccess: () => void;
}

export function AddStockItemDialog({ onSuccess }: AddStockItemDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useFormState(createStockItem, initialState);
    
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<SelectedProduct>(null);

    useEffect(() => {
        async function fetchProducts() {
            setIsLoadingProducts(true);
            const products = await getProducts();
            setAllProducts(products);
            setIsLoadingProducts(false);
        }
        if (open) {
            fetchProducts();
        }
    }, [open]);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                onSuccess();
                setOpen(false);
                setSelectedProduct(null);
            } else {
                toast({ variant: 'destructive', title: "Error", description: state.message });
            }
        }
    }, [state, toast, onSuccess]);
    
    // When the dialog closes, reset the internal state
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            formRef.current?.reset();
            setSelectedProduct(null);
        }
        setOpen(isOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Item to Inventory</DialogTitle>
                    <DialogDescription>Manually add an item and its initial quantity to your stock.</DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="space-y-4">
                     <ProductSelector
                        label="Product"
                        products={allProducts}
                        selectedProduct={selectedProduct}
                        onSelect={setSelectedProduct}
                        isLoading={isLoadingProducts}
                        quantity={1}
                        setQuantity={() => {}} // Not used here
                        unit="Units"
                        disabled={isLoadingProducts}
                    />
                    <input type="hidden" name="productId" value={selectedProduct?.id || ''} />

                     <div className="space-y-2">
                        <Label htmlFor="quantity">Initial Quantity</Label>
                        <Input id="quantity" name="quantity" type="number" required min="0" placeholder="e.g., 5000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea id="notes" name="notes" placeholder="e.g., Initial stock take, stock from previous supplier..." />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
