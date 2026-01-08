
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addMachine, type MachineActionResponse } from '@/lib/machine-actions';
import { Loader2, PlusCircle } from 'lucide-react';

const initialState: MachineActionResponse = {
  success: false,
  message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Machine'}
        </Button>
    );
}

interface AddMachineDialogProps {
    serviceProviderCompany: string;
    onSuccess: () => void;
}

export function AddMachineDialog({ serviceProviderCompany, onSuccess }: AddMachineDialogProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [state, formAction] = useFormState(addMachine, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                onSuccess();
                setOpen(false);
                formRef.current?.reset();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast, onSuccess]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Machine</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a New Machine</DialogTitle>
                    <DialogDescription>Enter the details for your new piece of equipment.</DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="serviceProviderCompany" value={serviceProviderCompany} />
                    <div className="space-y-2">
                        <Label htmlFor="name">Machine Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Bottling Line Alpha" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="operatorName">Operator Name (Optional)</Label>
                        <Input id="operatorName" name="operatorName" placeholder="e.g., John Doe" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select name="type" required>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bottling">Bottling</SelectItem>
                                    <SelectItem value="Labelling">Labelling</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" required>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operational">Operational</SelectItem>
                                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                    <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specifications">Specifications (Optional)</Label>
                        <Textarea id="specifications" name="specifications" placeholder="e.g., Capacity: 3000 bph, Max bottle height: 330mm..." />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
