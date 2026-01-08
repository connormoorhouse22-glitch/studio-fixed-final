
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { Product } from '@/lib/product-actions';
import { DeleteProductForm } from './delete-product-form';

interface DeleteProductDialogProps {
  product: Product;
  onSuccess: () => void;
}

export function DeleteProductDialog({ product, onSuccess }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess();
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={(e) => e.preventDefault()}
        >
          Delete Product
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the product <span className="font-semibold">{product.name}</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <DeleteProductForm id={product.id} onSuccess={handleSuccess} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
