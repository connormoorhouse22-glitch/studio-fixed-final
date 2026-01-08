
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export function ApproveUserButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      size="sm"
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      variant="outline"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      Approve
    </Button>
  );
}
