
'use client';

import { useEffect } from 'react';
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
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteBulkWineListing } from '@/lib/bulk-wine-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction type="submit" disabled={pending} className="bg-destructive hover:bg-destructive/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Deleting...' : 'Delete'}
    </AlertDialogAction>
  );
}

export function DeleteListingDialog({ listingId, asDropdownMenuItem = false }: { listingId: string; asDropdownMenuItem?: boolean }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(deleteBulkWineListing, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success',
          description: state.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  const TriggerComponent = asDropdownMenuItem ? (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      className="text-destructive focus:text-destructive focus:bg-destructive/10"
    >
      <Trash2 className="mr-2 h-4 w-4" /> Delete
    </DropdownMenuItem>
  ) : (
    <Button size="sm" variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" /> Delete
    </Button>
  );


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {TriggerComponent}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="listingId" value={listingId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bulk wine listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
