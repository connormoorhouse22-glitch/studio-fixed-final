
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
import { AddRecordForm } from './add-record-form';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddRecordDialogProps {
  onSuccess: () => void;
}

export function AddRecordDialog({ onSuccess }: AddRecordDialogProps) {
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
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Delivery Record</DialogTitle>
          <DialogDescription>
            Enter the details of the delivery to create a digital record.
          </DialogDescription>
        </DialogHeader>
        <AddRecordForm onSuccess={handleSuccess} onError={handleError} />
      </DialogContent>
    </Dialog>
  );
}
