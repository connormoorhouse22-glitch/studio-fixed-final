
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { sendBulkWineEnquiry } from '@/lib/email-actions';
import { Loader2 } from 'lucide-react';
import type { BulkWineListing } from '@/lib/bulk-wine-actions';

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
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? 'Sending...' : 'Make Enquiry'}
      </button>
    </DropdownMenuItem>
  );
}

interface EnquiryButtonProps {
    listingId: string;
}

export function EnquiryButton({ listingId }: EnquiryButtonProps) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(sendBulkWineEnquiry, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Enquiry Sent',
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
      <input type="hidden" name="listingId" value={listingId} />
      <SubmitButton />
    </form>
  );
}
