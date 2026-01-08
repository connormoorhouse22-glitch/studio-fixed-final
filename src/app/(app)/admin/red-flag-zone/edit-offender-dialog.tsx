
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
import { EditOffenderForm } from './edit-offender-form';
import { Edit } from 'lucide-react';
import type { Offender } from '@/lib/offender-actions';
import { useToast } from '@/hooks/use-toast';


interface EditOffenderDialogProps {
  offender: Offender;
  onSuccess: () => void;
}

export function EditOffenderDialog({ offender, onSuccess }: EditOffenderDialogProps) {
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
        title: 'Update Failed',
        description: message,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Flagged Entity</DialogTitle>
          <DialogDescription>
            Update the details for {offender.name}.
          </DialogDescription>
        </DialogHeader>
        <EditOffenderForm offender={offender} onSuccess={handleSuccess} onError={handleError} />
      </DialogContent>
    </Dialog>
  );
}
