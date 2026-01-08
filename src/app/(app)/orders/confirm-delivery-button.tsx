
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { confirmDelivery } from '@/lib/order-actions';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Check className="mr-2 h-4 w-4" />
      )}
      Confirm Delivery
    </Button>
  );
}

export function ConfirmDeliveryButton({ orderId }: { orderId: string }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(confirmDelivery, initialState);

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


  return (
    <form action={formAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <SubmitButton />
    </form>
  );
}
