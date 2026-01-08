
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/users';
import { DeleteUserForm } from './delete-user-form';

interface DeleteUserDialogProps {
  user: User;
  onSuccess: () => void;
}

export function DeleteUserDialog({ user, onSuccess }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess();
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={(e) => e.preventDefault()}
        >
          Delete User
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the account for <span className="font-semibold">{user.name}</span> ({user.email}). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <DeleteUserForm email={user.email} onSuccess={handleSuccess} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
