
'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateOffender, type Offender } from '@/lib/offender-actions';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
        </>
        ) : 'Save Changes'
      }
    </Button>
  );
}

interface EditOffenderFormProps {
  offender: Offender;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function EditOffenderForm({ offender, onSuccess, onError }: EditOffenderFormProps) {
  const updateOffenderWithId = updateOffender.bind(null, offender.id);
  const [state, formAction] = useFormState(updateOffenderWithId, initialState);
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        onSuccess(state.message);
      } else {
        onError(state.message);
      }
    }
  }, [state, onSuccess, onError]);

  return (
    <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={offender.name} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input id="company" name="company" defaultValue={offender.company} />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" name="email" type="email" defaultValue={offender.email} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="telephone">Telephone (Optional)</Label>
                <Input id="telephone" name="telephone" type="tel" defaultValue={offender.telephone} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="reason">Reason for Flagging</Label>
            <Textarea id="reason" name="reason" defaultValue={offender.reason} required />
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
