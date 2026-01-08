
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/users';
import { EditUserForm } from './edit-user-form';

interface EditUserDialogProps {
  user: User;
  onSuccess: () => void;
}

export function EditUserDialog({ user, onSuccess }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Edit User
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>
            Make changes to the profile for <span className="font-semibold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <EditUserForm user={user} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
