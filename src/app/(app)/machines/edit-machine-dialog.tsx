
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
import { updateMachine, type Machine, type MachineActionResponse } from '@/lib/machine-actions';
import { Loader2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const initialState: MachineActionResponse = {
  success: false,
  message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
        </Button>
    );
}

interface EditMachineDialogProps {
    machine: Machine;
    onSuccess: () => void;
}

export function EditMachineDialog({ machine, onSuccess }: EditMachineDialogProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const updateMachineWithId = updateMachine.bind(null, machine.id);
    const [state, formAction] = useFormState(updateMachineWithId, initialState);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                onSuccess();
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast, onSuccess]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Machine</DialogTitle>
                    <DialogDescription>Update the details for "{machine.name}".</DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Machine Name</Label>
                        <Input id="name" name="name" defaultValue={machine.name} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="operatorName">Operator Name</Label>
                        <Input id="operatorName" name="operatorName" defaultValue={machine.operatorName} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select name="type" defaultValue={machine.type} required>
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
                            <Select name="status" defaultValue={machine.status} required>
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
                        <Textarea id="specifications" name="specifications" defaultValue={machine.specifications} />
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
