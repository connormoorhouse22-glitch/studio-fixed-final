
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';

interface SubmitButtonProps {
    buttonText?: string;
}

export function SubmitButton({ buttonText = "Submit Order" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
