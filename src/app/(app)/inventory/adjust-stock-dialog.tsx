
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateStockLevel, type StockActionResponse, type StockItem } from '@/lib/stock-actions';
import { Loader2 } from 'lucide-react';

const initialState: StockActionResponse = { success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Stock'}
        </Button>
    )
}

interface AdjustStockDialogProps {
    stockItem: StockItem;
    onSuccess: () => void;
}

export function AdjustStockDialog({ stockItem, onSuccess }: AdjustStockDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useFormState(updateStockLevel.bind(null, stockItem.id), initialState);

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
                <Button>Adjust Stock</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adjust Stock for {stockItem.productName}</DialogTitle>
                    <DialogDescription>Current Quantity: {stockItem.quantity.toLocaleString()}</DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <RadioGroup name="adjustmentType" defaultValue="addition" className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="addition" id="addition"/>
                                <Label htmlFor="addition">Add to Stock</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="consumption" id="consumption"/>
                                <Label htmlFor="consumption">Use from Stock</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" type="number" required min="1" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea id="notes" name="notes" placeholder="e.g., Bottling run for 2024 Chenin, Stock take adjustment..." />
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
