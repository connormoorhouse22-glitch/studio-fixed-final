
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
import { Button } from '@/components/ui/button';
import { AddOffenderForm } from './add-offender-form';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddOffenderDialogProps {
  onSuccess: () => void;
}

export function AddOffenderDialog({ onSuccess }: AddOffenderDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (message: string) => {
    onSuccess();
    setOpen(false);
    toast({
        title: 'Success',
        description: message,
    });
  };

  const handleError = (message: string) => {
    toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: message,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Offender
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Red Flag Zone</DialogTitle>
          <DialogDescription>
            Enter the details of the individual or company to be flagged. This will only be visible to administrators.
          </DialogDescription>
        </DialogHeader>
        <AddOffenderForm onSuccess={handleSuccess} onError={handleError} />
      </DialogContent>
    </Dialog>
  );
}
