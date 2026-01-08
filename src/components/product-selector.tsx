
'use client';

import Image from 'next/image';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import type { Product } from '@/lib/product-actions';
import { useState } from 'react';
import { Input } from './ui/input';

export type SelectedProduct = Product | null;

interface ProductSelectorProps {
  label: string;
  products: Product[];
  selectedProduct: SelectedProduct;
  onSelect: (product: SelectedProduct) => void;
  isLoading: boolean;
  quantity: number;
  setQuantity: (quantity: number) => void;
  unit: string;
  disabled?: boolean;
}

export function ProductSelector({
  label,
  products,
  selectedProduct,
  onSelect,
  isLoading,
  quantity,
  setQuantity,
  unit,
  disabled = false
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (productName: string) => {
    const product = products.find((p) => p.name === productName);
    onSelect(product || null);
    setOpen(false);
  };
  
  if (isLoading) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Skeleton className="h-10 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className={cn(disabled && "text-muted-foreground")}>{label}</Label>
        {selectedProduct && (
            <div className="flex items-center gap-2">
                 <Label htmlFor={`${label}-quantity`} className="text-xs text-muted-foreground">{unit}</Label>
                 <Input 
                    id={`${label}-quantity`}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="h-8 w-20"
                 />
            </div>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            {selectedProduct ? (
              <div className="flex items-center gap-2">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  width={24}
                  height={24}
                  className="rounded-sm object-cover"
                />
                <span className="truncate">{selectedProduct.supplier} - {selectedProduct.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select a {label.toLowerCase()}...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={`Search for a ${label.toLowerCase()}...`} />
            <CommandList>
                <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                <CommandGroup>
                {products.map((product) => (
                    <CommandItem
                        key={product.id}
                        value={product.name}
                        onSelect={handleSelect}
                    >
                        <Check
                            className={cn(
                                'mr-2 h-4 w-4',
                                selectedProduct?.name === product.name ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                         <div className="flex items-center gap-2">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={24}
                                height={24}
                                className="rounded-sm object-cover"
                            />
                            <span className="truncate">{product.supplier} - {product.name}</span>
                        </div>
                         <span className="ml-auto text-xs font-mono text-muted-foreground">
                            {typeof product.price === 'number' ? `ZAR ${product.price.toFixed(2)}` : 'N/A'}
                        </span>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
