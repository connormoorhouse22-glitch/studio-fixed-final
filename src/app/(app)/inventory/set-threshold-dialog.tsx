
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { setLowStockThreshold, type StockActionResponse, type StockItem } from '@/lib/stock-actions';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

const initialState: StockActionResponse = { success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Set Threshold'}
        </Button>
    )
}

interface SetThresholdDialogProps {
    stockItem: StockItem;
    onSuccess: () => void;
}

export function SetThresholdDialog({ stockItem, onSuccess }: SetThresholdDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [state, formAction] = useFormState(setLowStockThreshold.bind(null, stockItem.id), initialState);

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
                <DropdownMenuItem onSelect={e => e.preventDefault()}>Set Low Stock Alert</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Low Stock Alert</DialogTitle>
                    <DialogDescription>Get a visual warning when stock for "{stockItem.productName}" falls below this level.</DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="threshold">Alert Threshold</Label>
                        <Input id="threshold" name="threshold" type="number" required min="0" defaultValue={stockItem.lowStockThreshold || 0} />
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
