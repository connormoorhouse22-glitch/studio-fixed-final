
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Mail } from 'lucide-react';
import { resendOrderNotification } from '@/lib/email-actions';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      disabled={pending}
      asChild
    >
      <button type="submit" className="w-full">
        <Mail className="mr-2 h-4 w-4" />
        {pending ? 'Resending...' : 'Resend Notification'}
      </button>
    </DropdownMenuItem>
  );
}

export function ResendNotificationButton({ orderId }: { orderId: string }) {
  const { toast } = useToast();
  // We need to use a unique key for the form to reset the action state.
  // Using a random key for simplicity here.
  const [key, setKey] = useState(Math.random().toString());

  const [state, formAction] = useFormState(resendOrderNotification.bind(null, orderId), initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Email Sent',
          description: state.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Email Failed',
          description: state.message,
        });
      }
      // By changing the key of the form, we force React to re-mount it,
      // which effectively resets the useFormState hook.
      setKey(Math.random().toString());
    }
  }, [state, toast]);

  return (
    <form key={key} action={formAction}>
      <SubmitButton />
    </form>
  );
}
