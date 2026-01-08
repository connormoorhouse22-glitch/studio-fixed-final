
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
import type { User } from '@/lib/users';
import { EditTierForm } from './edit-tier-form';

interface EditTierDialogProps {
  user: User;
  supplierCompany: string;
  onSuccess: () => void;
}

export function EditTierDialog({ user, supplierCompany, onSuccess }: EditTierDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Set Tier</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Pricing Tier</DialogTitle>
          <DialogDescription>
            Assign your pricing tier for <span className="font-semibold">{user.company}</span>.
          </DialogDescription>
        </DialogHeader>
        <EditTierForm user={user} supplierCompany={supplierCompany} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
