
'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { deleteOrder } from '@/lib/order-actions';
import { Loader2, Trash2 } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
};

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction type="submit" disabled={pending} className="bg-destructive hover:bg-destructive/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Deleting...' : 'Delete'}
    </AlertDialogAction>
  );
}

export function DeleteOrderDialog({ orderId, orderNumber }: { orderId: string, orderNumber: string }) {
  const { toast } = useToast();
  const deleteOrderWithId = deleteOrder.bind(null, orderId);
  const [state, formAction] = useFormState(deleteOrderWithId, initialState);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success',
          description: state.message,
        });
        setIsOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Order
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete order #{orderNumber}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <DeleteButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
