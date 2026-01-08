
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
import { InviteUserForm } from './invite-user-form';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InviteUserDialogProps {
  onSuccess: () => void;
}

export function InviteUserDialog({ onSuccess }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (message: string) => {
    onSuccess();
    setOpen(false);
    toast({
        title: 'User Invited',
        description: message,
    });
  };

  const handleError = (message: string) => {
    toast({
        variant: 'destructive',
        title: 'Invitation Failed',
        description: message,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a New User</DialogTitle>
          <DialogDescription>
            Enter the user's email and assign a role. They will receive an invitation to set up their account.
          </DialogDescription>
        </DialogHeader>
        <InviteUserForm onSuccess={handleSuccess} onError={handleError} />
      </DialogContent>
    </Dialog>
  );
}
