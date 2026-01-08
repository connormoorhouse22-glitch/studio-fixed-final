
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUser, type User, type UpdateUserResponse } from '@/lib/user-actions';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';

const initialState: UpdateUserResponse = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function EditTierForm({
  user,
  supplierCompany,
  onSuccess,
}: {
  user: User;
  supplierCompany: string;
  onSuccess: () => void;
}) {
  const updateUserWithTier = (prevState: { message: string }, formData: FormData) => {
    // Add the supplier company to the form data so the action knows which tier to update.
    formData.append('supplierCompany', supplierCompany);
    return updateUser(user.email, prevState, formData);
  }
  
  const [state, formAction] = useFormState(updateUserWithTier, initialState);

  useEffect(() => {
    if (state.message === 'Success') {
      onSuccess();
    }
  }, [state, onSuccess]);
  
  const currentTier = user.pricingTiers?.[supplierCompany] || user.pricingTiers?.default || 'Tier 1';

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
          <Label htmlFor="pricingTier">Pricing Tier</Label>
          <Select name="pricingTier" defaultValue={currentTier}>
            <SelectTrigger id="pricingTier">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tier 1">Tier 1</SelectItem>
              <SelectItem value="Tier 2">Tier 2</SelectItem>
              <SelectItem value="Tier 3">Tier 3</SelectItem>
              <SelectItem value="Tier 4">Tier 4</SelectItem>
              <SelectItem value="Tier 5">Tier 5</SelectItem>
              <SelectItem value="Tier 6">Tier 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      {state.message && state.message !== 'Success' && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
