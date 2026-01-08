
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { logAddition, type CellarActionResponse } from '@/lib/cellar-actions';
import { type StockItem } from '@/lib/stock-actions';
import { type WineryVessel } from '@/lib/cellar-actions';
import { Loader2, PlusCircle } from 'lucide-react';

const initialState: CellarActionResponse = { success: false, message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging...</> : 'Log Addition'}
        </Button>
    )
}

interface LogAdditionDialogProps {
    stockItem: StockItem;
    vessels: WineryVessel[];
    onSuccess: () => void;
}

export function LogAdditionDialog({ stockItem, vessels, onSuccess }: LogAdditionDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useFormState(logAddition, initialState);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: "Success", description: state.message });
                onSuccess();
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: "Error", description: state.message });
            }
        }
    }, [state, toast, onSuccess]);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Log Addition</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Addition of {stockItem.productName}</DialogTitle>
                    <DialogDescription>
                        Record the use of this product in a specific tank or barrel group. 
                        Stock on hand: <strong>{stockItem.quantity.toLocaleString()}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="productId" value={stockItem.productId} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="vesselId">Vessel</Label>
                            <Select name="vesselId" required>
                               <SelectTrigger><SelectValue placeholder="Select vessel..." /></SelectTrigger>
                               <SelectContent>
                                {vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="timestamp">Date of Addition</Label>
                           <Input id="timestamp" name="timestamp" type="datetime-local" required defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="quantityUsed">Quantity Used</Label>
                           <Input id="quantityUsed" name="quantityUsed" type="number" required min="0" step="any" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Select name="unit" required defaultValue="g">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="g">Grams (g)</SelectItem>
                                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                    <SelectItem value="ml">Millilitres (ml)</SelectItem>
                                    <SelectItem value="l">Litres (l)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Addition</Label>
                        <Textarea id="reason" name="reason" placeholder="e.g., Yeast inoculation, Tannin addition for structure..." required />
                    </div>
                    
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
