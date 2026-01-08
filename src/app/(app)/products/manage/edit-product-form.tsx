

'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateProduct, type Product, type ProductUpdateResponse } from '@/lib/product-actions';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { getProducts } from '@/lib/product-actions';
import { Skeleton } from '@/components/ui/skeleton';

const initialState: ProductUpdateResponse = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function EditProductForm({
  product,
  onSuccess,
}: {
  product: Product;
  onSuccess: () => void;
}) {
  const [state, formAction] = useFormState(updateProduct.bind(null, product.id), initialState);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
        setIsLoading(true);
        const products = await getProducts();
        setAllProducts(products);
        setIsLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (state.message === 'Success') {
      onSuccess();
    }
  }, [state, onSuccess]);
  
  const isBottleProduct = product.category === 'Bottles' || product.category === 'Bordeaux' || product.category === 'Burgundy' || product.category === 'Flute Hock';
  const isLabelProduct = product.category === 'Carton & Importer labels';

  if (isLoading) {
    return <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-20" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
    </div>
  }

  const supplierCategories = [...new Set(allProducts.filter(p => p.supplier === product.supplier).map(p => p.category))];

  return (
    <form action={formAction} className="grid grid-rows-[1fr_auto] gap-4 max-h-[70vh]">
        <div className="space-y-4 overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" defaultValue={product.name} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={product.description} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={product.category}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {supplierCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                             <SelectItem value="Carton & Importer labels">Carton & Importer labels</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subCategory">Sub-category</Label>
                    <Input id="subCategory" name="subCategory" defaultValue={product.subCategory} />
                </div>
            </div>

            {isLabelProduct && (
                 <>
                    <Separator />
                    <h3 className="text-md font-medium">Label Specifications</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="labelSize">Label Size</Label>
                            <Input id="labelSize" name="labelSize" defaultValue={product.labelSize} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="labelText">Label Text/Title</Label>
                            <Input id="labelText" name="labelText" defaultValue={product.labelText} />
                        </div>
                    </div>
                </>
            )}

            <Separator />
                <h3 className="text-md font-medium">Pricing Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (Tier 1)</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceTier2">Price (Tier 2)</Label>
                        <Input id="priceTier2" name="priceTier2" type="number" step="0.01" defaultValue={product.priceTier2} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceTier3">Price (Tier 3)</Label>
                        <Input id="priceTier3" name="priceTier3" type="number" step="0.01" defaultValue={product.priceTier3} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceTier4">Price (Tier 4)</Label>
                        <Input id="priceTier4" name="priceTier4" type="number" step="0.01" defaultValue={product.priceTier4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceTier5">Price (Tier 5)</Label>
                        <Input id="priceTier5" name="priceTier5" type="number" step="0.01" defaultValue={product.priceTier5} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceTier6">Price (Tier 6)</Label>
                        <Input id="priceTier6" name="priceTier6" type="number" step="0.01" defaultValue={product.priceTier6} />
                    </div>
                </div>
            <Separator />
            <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" name="image" defaultValue={product.image} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="aiHint">AI Hint</Label>
                <Input id="aiHint" name="aiHint" defaultValue={product.aiHint} />
            </div>
             {isBottleProduct && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stockOnHand">Stock on Hand</Label>
                            <Input id="stockOnHand" name="stockOnHand" type="number" defaultValue={product.stockOnHand} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unitsPerPallet">Units per Pallet</Label>
                            <Input id="unitsPerPallet" name="unitsPerPallet" type="number" defaultValue={product.unitsPerPallet} />
                        </div>
                    </div>
                )}

            {state.message && state.message !== 'Success' && (
                <p className="text-sm text-destructive">{state.message}</p>
            )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
