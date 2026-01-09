'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createBooking, type BookingResponse, type WorkOrder } from '@/lib/booking-actions';
import { Loader2, PlusCircle, Trash2, User, Phone, MapPin } from 'lucide-react';
import { SheetFooter, SheetClose } from '@/components/ui/sheet';
import type { User as ProducerUser } from '@/lib/users';

const initialState: BookingResponse = { success: false, message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <span className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</span> : 'Submit Request'}
        </Button>
    )
}

const southAfricanCultivars = ["Cabernet Franc", "Cabernet Sauvignon", "Chardonnay", "Chenin Blanc", "Cinsaut", "Colombar", "Merlot", "Muscat d'Alexandrie", "Pinot Noir", "Pinotage", "Red Blend", "Ruby Cabernet", "Sauvignon Blanc", "Semillon", "Shiraz", "Viognier", "White Blend"].sort();
const bottleTypes = ["750ml Claret", "750ml Burgundy", "750ml MCC", "375ml Claret", "375ml Burgundy", "375ml MCC", "1500ml Claret", "1500ml Burgundy", "1500ml MCC", "500ml Claret", "500ml Burgundy", "500ml MCC", "187ml Claret", "187ml Burgundy"];

interface BookingFormProps {
    selectedDate: Date;
    providerCompany: string;
    filtrationOptions: string[];
    service: string;
    producer: ProducerUser;
    onSuccess: () => void;
}

export function BookingForm({ selectedDate, providerCompany, filtrationOptions, service, producer, onSuccess }: BookingFormProps) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(async (prevState: BookingResponse, formData: FormData) => {
        return await createBooking(producer, prevState, formData);
    }, initialState);

    const formRef = useRef<HTMLFormElement>(null);
    const [workOrders, setWorkOrders] = useState<any[]>([
        { service: service, contactPerson: producer?.name || 'N/A', contactNumber: producer?.contactNumber || 'N/A', location: producer?.billingAddress || 'N/A' }
    ]);
    
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                onSuccess();
                formRef.current?.reset();
            } else {
                 toast({ variant: 'destructive', title: 'Submission Failed', description: state.message });
            }
        }
    }, [state, toast, onSuccess]);

    const handleWorkOrderChange = (index: number, field: string, value: any) => {
        const newWorkOrders = [...workOrders];
        newWorkOrders[index] = { ...newWorkOrders[index], [field]: value };
        if (field === 'volumeLiters') {
            newWorkOrders[index].equivalentBottles = Math.ceil((Number(value) || 0) / 0.75);
        }
        setWorkOrders(newWorkOrders);
    };

    return (
        <form ref={formRef} action={formAction} className="space-y-4 py-4">
            <input type="hidden" name="date" value={selectedDate.toISOString()} />
            <input type="hidden" name="providerCompany" value={providerCompany} />
            <input type="hidden" name="workOrders" value={JSON.stringify(workOrders)} />
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {workOrders.map((wo, index) => (
                    <div key={index} className="space-y-4 border p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Cultivar</Label>
                                <Select onValueChange={(v) => handleWorkOrderChange(index, 'cultivar', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{southAfricanCultivars.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Volume (L)</Label>
                                <Input type="number" onChange={(e) => handleWorkOrderChange(index, 'volumeLiters', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Bottle Type</Label>
                            <Select onValueChange={(v) => handleWorkOrderChange(index, 'bottleType', v)}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{bottleTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>

            <SheetFooter className="mt-6">
                <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                <SubmitButton />
            </SheetFooter>
        </form>
    );
}