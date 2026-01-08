
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { AlertDialogAction } from '@/components/ui/alert-dialog';
import { deleteProduct } from '@/lib/product-actions';

const initialState = {
  message: '',
};

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction
      type="submit"
      disabled={pending}
      className="bg-destructive hover:bg-destructive/90"
    >
      {pending ? 'Deleting...' : 'Delete'}
    </AlertDialogAction>
  );
}

export function DeleteProductForm({
  id,
  onSuccess,
}: {
  id: string;
  onSuccess: () => void;
}) {
  const [state, formAction] = useFormState(deleteProduct.bind(null, id), initialState);

  useEffect(() => {
    if (state.message === 'Success') {
      onSuccess();
    }
  }, [state, onSuccess]);


  return (
    <form action={formAction}>
      <DeleteButton />
    </form>
  );
}
