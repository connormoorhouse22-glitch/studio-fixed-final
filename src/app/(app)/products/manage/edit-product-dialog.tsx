
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import type { Product } from '@/lib/product-actions';
import { EditProductForm } from './edit-product-form';

interface EditProductDialogProps {
  product: Product;
  onSuccess: () => void;
  useButtonTrigger?: boolean;
}

export function EditProductDialog({ product, onSuccess, useButtonTrigger = false }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess();
    setOpen(false);
  };

  const TriggerComponent = useButtonTrigger ? (
    <Button variant="outline">
      <Edit className="mr-2 h-4 w-4" /> Edit
    </Button>
  ) : (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      Edit Product
    </DropdownMenuItem>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerComponent}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product Details</DialogTitle>
          <DialogDescription>
            Make changes to the details for <span className="font-semibold">{product.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <EditProductForm product={product} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
