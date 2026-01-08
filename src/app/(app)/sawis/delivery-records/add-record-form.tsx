
'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { createDeliveryRecord, type DeliveryRecordResponse } from '@/lib/delivery-record-actions';
import { Textarea } from '@/components/ui/textarea';

const initialState: DeliveryRecordResponse = {
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
        ) : 'Save Record'
      }
    </Button>
  );
}

interface AddRecordFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function AddRecordForm({ onSuccess, onError }: AddRecordFormProps) {
  const [state, formAction] = useFormState(createDeliveryRecord, initialState);
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
    <form ref={formRef} action={formAction} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="consignor">Consignor</Label>
                <Input id="consignor" name="consignor" required placeholder="e.g., Your Winery Name" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="consignee">Consignee (Name & Premises)</Label>
                <Input id="consignee" name="consignee" required placeholder="e.g., Client Name & Address" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input id="deliveryDate" name="deliveryDate" type="date" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="deliveryRecordNo">Delivery Record No.</Label>
                <Input id="deliveryRecordNo" name="deliveryRecordNo" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="vehicleRegistration">Vehicle Registration</Label>
                <Input id="vehicleRegistration" name="vehicleRegistration" required />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="sawis6No">SAWIS 6 No. (Optional)</Label>
                <Input id="sawis6No" name="sawis6No" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="wsbRecordNo">WS/B Record No. (Optional)</Label>
                <Input id="wsbRecordNo" name="wsbRecordNo" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="vintage">Vintage</Label>
                <Input id="vintage" name="vintage" type="number" required />
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="productDescription">Description of product delivered</Label>
            <Textarea id="productDescription" name="productDescription" placeholder="e.g., Origin, Variety..." required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="fromContainer">From container(s) no(s)</Label>
                <Input id="fromContainer" name="fromContainer" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="volumeLitres">Estimated volume (litres)</Label>
                <Input id="volumeLitres" name="volumeLitres" type="number" required />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="consignorSignature">Consignor's Signature</Label>
                <Input id="consignorSignature" name="consignorSignature" type="file" accept="image/*,.pdf"/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="driverSignature">Truck Driver's Signature</Label>
                <Input id="driverSignature" name="driverSignature" type="file" accept="image/*,.pdf"/>
            </div>
        </div>
        
      <DialogFooter className="pt-4 border-t">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton />
      </DialogFooter>
    </form>
  );
}
