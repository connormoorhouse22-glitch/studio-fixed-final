
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createManualBooking, type BookingResponse, type WorkOrder } from '@/lib/booking-actions';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Machine } from '@/lib/machine-actions';

const initialState: BookingResponse = { success: false, message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create Manual Booking'}
        </Button>
    )
}

const southAfricanCultivars = [
    "Cabernet Franc", "Cabernet Sauvignon", "Chardonnay", "Chenin Blanc", "Cinsaut", 
    "Colombar", "Merlot", "Muscat d'Alexandrie", "Pinot Noir", "Pinotage", "Red Blend", 
    "Ruby Cabernet", "Sauvignon Blanc", "Semillon", "Shiraz", "Viognier", "White Blend"
].sort();

const bottleTypes = [
    "750ml Claret", "750ml Burgundy", "750ml MCC", "375ml Claret", "375ml Burgundy", 
    "375ml MCC", "1500ml Claret", "1500ml Burgundy", "1500ml MCC", "500ml Claret", 
    "500ml Burgundy", "500ml MCC", "187ml Claret", "187ml Burgundy"
];

type LocalWorkOrder = Partial<WorkOrder> & { equivalentBottles?: number };

interface ManualBookingFormProps {
    selectedDate: Date;
    machines: Machine[];
    onSuccess: () => void;
}

export function ManualBookingForm({ selectedDate, machines, onSuccess }: ManualBookingFormProps) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(createManualBooking, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [workOrders, setWorkOrders] = useState<LocalWorkOrder[]>([{}]);
    const [service, setService] = useState<'Mobile Bottling' | 'Mobile Labelling' | ''>('');
     const [producerCompany, setProducerCompany] = useState('');

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                onSuccess();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            }
        }
    }, [state, toast, onSuccess]);
    
    const currentYear = new Date().getFullYear();
    const vintageYears = Array.from({ length: 9 }, (_, i) => currentYear - i);

    const handleWorkOrderChange = (index: number, field: keyof LocalWorkOrder, value: any) => {
        const newWorkOrders = [...workOrders];
        newWorkOrders[index] = { ...newWorkOrders[index], [field]: value };
        setWorkOrders(newWorkOrders);
    };

    const addWorkOrder = () => setWorkOrders([...workOrders, {}]);
    const removeWorkOrder = (index: number) => {
        if (workOrders.length > 1) {
            setWorkOrders(workOrders.filter((_, i) => i !== index));
        }
    };
    
    const availableMachines = machines.filter(m => service.replace('Mobile ', '') === m.type);

    return (
        <form ref={formRef} action={formAction} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <input type="hidden" name="date" value={selectedDate.toISOString()} />
            <input type="hidden" name="workOrders" value={JSON.stringify(workOrders.map(wo => ({...wo, service})))} />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="producerCompany">Client / Reason</Label>
                    <Input id="producerCompany" name="producerCompany" required value={producerCompany} onChange={(e) => setProducerCompany(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select name="service" required value={service} onValueChange={(v: any) => setService(v)}>
                        <SelectTrigger><SelectValue placeholder="Select service..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mobile Bottling">Mobile Bottling</SelectItem>
                            <SelectItem value="Mobile Labelling">Mobile Labelling</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="assignedMachineId">Assigned Machine (Optional)</Label>
                <Select name="assignedMachineId">
                    <SelectTrigger><SelectValue placeholder="Select a machine..." /></SelectTrigger>
                    <SelectContent>
                        {availableMachines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <Separator />
            
            {workOrders.map((wo, index) => (
                <div key={index} className="space-y-4 border p-4 rounded-md relative">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Wine #{index + 1}</h4>
                        {workOrders.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="text-destructive h-7 w-7 absolute top-1 right-1" onClick={() => removeWorkOrder(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Cultivar</Label><Select required onValueChange={(v) => handleWorkOrderChange(index, 'cultivar', v)}><SelectTrigger><SelectValue placeholder="Select cultivar..." /></SelectTrigger><SelectContent>{southAfricanCultivars.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-1"><Label>Vintage</Label><Select required onValueChange={(v) => handleWorkOrderChange(index, 'vintage', v)}><SelectTrigger><SelectValue placeholder="Select vintage..." /></SelectTrigger><SelectContent>{vintageYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Volume (Litres)</Label><Input type="number" required value={wo.volumeLiters || ''} onChange={(e) => handleWorkOrderChange(index, 'volumeLiters', parseInt(e.target.value, 10))} /></div>
                        <div className="space-y-1"><Label>Equivalent 750ml</Label><Input type="text" readOnly value={Math.ceil((wo.volumeLiters || 0) / 0.75).toLocaleString()} className="bg-muted" /></div>
                    </div>
                    <div className="space-y-1"><Label>Bottle Type</Label><Select required onValueChange={(v) => handleWorkOrderChange(index, 'bottleType', v)}><SelectTrigger><SelectValue placeholder="Select bottle type..." /></SelectTrigger><SelectContent>{bottleTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1"><Label>Closure Type</Label><Select required onValueChange={(v) => handleWorkOrderChange(index, 'closureType', v)}><SelectTrigger><SelectValue placeholder="Select closure type..." /></SelectTrigger><SelectContent><SelectItem value="Cork">Cork</SelectItem><SelectItem value="Screwcap">Screwcap</SelectItem><SelectItem value="Crown cap">Crown cap</SelectItem><SelectItem value="Stelvin Lux">Stelvin Lux</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                    <div className="space-y-1"><Label>Special Instructions</Label><Textarea onChange={(e) => handleWorkOrderChange(index, 'specialInstructions', e.target.value)} /></div>
                </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addWorkOrder}><PlusCircle className="mr-2 h-4 w-4" /> Add Wine</Button>

            <DialogFooter className="mt-6 pt-4 border-t">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
    );
}

