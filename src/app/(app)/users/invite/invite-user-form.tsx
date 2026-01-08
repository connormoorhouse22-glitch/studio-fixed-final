
'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { inviteUser } from '@/lib/userActions';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
        </>
        ) : 'Send Invitation'
      }
    </Button>
  );
}

interface InviteUserFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function InviteUserForm({ onSuccess, onError }: InviteUserFormProps) {
  const [state, formAction] = useFormState(inviteUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        onSuccess(state.message);
        formRef.current?.reset();
      } else {
        onError(state.message);
      }
    }
  }, [state, onSuccess, onError]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="new.user@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" required>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Producer">Producer</SelectItem>
            <SelectItem value="Supplier">Supplier</SelectItem>
            <SelectItem value="Mobile Service Provider">Mobile Service Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
