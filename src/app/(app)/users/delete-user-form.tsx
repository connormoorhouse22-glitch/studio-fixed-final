
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { AlertDialogAction } from '@/components/ui/alert-dialog';
import { deleteUser } from '@/lib/userActions';
import { useToast } from '@/hooks/use-toast';

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

export function DeleteUserForm({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(deleteUser.bind(null, email), initialState);

  useEffect(() => {
    if (state.message) {
      if (state.message === 'Success') {
        toast({ title: 'User Deleted', description: 'The user account has been permanently removed.' });
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      }
    }
  }, [state, onSuccess, toast]);


  return (
    <form action={formAction}>
      <DeleteButton />
    </form>
  );
}
