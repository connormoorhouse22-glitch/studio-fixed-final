'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addVessel, type CellarActionResponse } from '@/lib/cellar-actions';
import { Loader2, PlusCircle } from 'lucide-react';

const initialState: CellarActionResponse = { success: false, message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add Vessel'}
        </Button>
    )
}

interface AddVesselDialogProps {
    onSuccess: () => void;
}

export function AddVesselDialog({ onSuccess }: AddVesselDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    
    // Bind the user's email to the server action
    const addVesselWithEmail = (prevState: CellarActionResponse, formData: FormData) => {
        const producerEmail = localStorage.getItem('userEmail');
        if (!producerEmail) {
            return { success: false, message: 'Could not find user email. Please log in again.' };
        }
        return addVessel(producerEmail, prevState, formData);
    };

    const [state, formAction] = useFormState(addVesselWithEmail, initialState);
    const [vesselType, setVesselType] = useState<'SS-Tank' | 'Barrel Group' | ''>('');

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
    
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            formRef.current?.reset();
            setVesselType('');
        }
        setOpen(isOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Vessel</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Cellar Vessel</DialogTitle>
                    <DialogDescription>Define a new tank or barrel group in your cellar.</DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="name">Vessel Name / Code</Label>
                           <Input id="name" name="name" required placeholder="e.g., T101, B05" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Vessel Type</Label>
                            <Select name="type" required onValueChange={(v: 'SS-Tank' | 'Barrel Group') => setVesselType(v)}>
                                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SS-Tank">SS-Tank</SelectItem>
                                    <SelectItem value="Barrel Group">Barrel Group</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="capacityLitres">Total Capacity (Litres)</Label>
                           <Input id="capacityLitres" name="capacityLitres" type="number" required placeholder="e.g., 5000" />
                        </div>
                        {vesselType === 'Barrel Group' && (
                            <div className="space-y-2">
                               <Label htmlFor="barrelCount">Number of Barrels</Label>
                               <Input id="barrelCount" name="barrelCount" type="number" placeholder="e.g., 10" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currentContents">Current Contents (Optional)</Label>
                        <Input id="currentContents" name="currentContents" placeholder="e.g., 2024 Chenin Blanc" />
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
