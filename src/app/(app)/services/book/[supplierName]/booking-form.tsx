
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
import { Separator } from '@/components/ui/separator';

const initialState: BookingResponse = { success: false, message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Request'}
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

interface BookingFormProps {
    selectedDate: Date;
    providerCompany: string;
    filtrationOptions: string[];
    service: 'Mobile Bottling' | 'Mobile Labelling' | 'Meeting Room';
    producer: ProducerUser;
    onSuccess: () => void;
}

export function BookingForm({ selectedDate, providerCompany, filtrationOptions, service, producer, onSuccess }: BookingFormProps) {
    const { toast } = useToast();
    const createBookingWithProducer = createBooking.bind(null, producer);
    const [state, formAction] = useFormState(createBookingWithProducer, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [workOrders, setWorkOrders] = useState<LocalWorkOrder[]>([
        { service: service, contactPerson: producer.name, contactNumber: producer.contactNumber, location: producer.billingAddress }
    ]);
    
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                onSuccess();
                formRef.current?.reset();
            } else {
                 toast({ variant: 'destructive', title: 'Submission Failed', description: state.message });
            }
        }
    }, [state, toast, onSuccess]);

    const currentYear = new Date().getFullYear();
    const vintageYears = Array.from({ length: 9 }, (_, i) => currentYear - i);

    const handleWorkOrderChange = (index: number, field: keyof LocalWorkOrder, value: any) => {
        const newWorkOrders = [...workOrders];
        const currentWorkOrder = { ...newWorkOrders[index] };
        currentWorkOrder[field] = value;

        if (service === 'Mobile Labelling') {
            if (field === 'equivalentBottles') {
                currentWorkOrder.volumeLiters = (Number(value) || 0) * 0.75;
            }
        } else {
            if (field === 'volumeLiters') {
                currentWorkOrder.equivalentBottles = Math.ceil((Number(value) || 0) / 0.75);
            }
        }

        newWorkOrders[index] = currentWorkOrder;
        setWorkOrders(newWorkOrders);
    };

    const addWorkOrder = () => {
        setWorkOrders([...workOrders, { service: service, contactPerson: producer.name, contactNumber: producer.contactNumber, location: producer.billingAddress }]);
    };

    const removeWorkOrder = (index: number) => {
        if (workOrders.length > 1) setWorkOrders(workOrders.filter((_, i) => i !== index));
    };

    if (service === 'Meeting Room') {
        return (
             <form ref={formRef} action={formAction} className="space-y-4 py-4">
                <input type="hidden" name="date" value={selectedDate.toISOString()} />
                <input type="hidden" name="providerCompany" value={providerCompany} />
                <input type="hidden" name="workOrders" value={JSON.stringify([{ service: 'Meeting Room', volumeLiters: 0, bottleType: 'N/A', closureType: 'N/A', cultivar: 'N/A', vintage: 'N/A', contactPerson: producer.name, contactNumber: producer.contactNumber, location: providerCompany }])} />
                <SheetFooter className="mt-6 pt-4 border-t">
                    <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                    <SubmitButton />
                </SheetFooter>
            </form>
        )
    }

    return (
        <form ref={formRef} action={formAction} className="space-y-4 py-4">
            <input type="hidden" name="date" value={selectedDate.toISOString()} />
            <input type="hidden" name="providerCompany" value={providerCompany} />
            <input type="hidden" name="workOrders" value={JSON.stringify(workOrders)} />
            
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-4">
                 <div className="space-y-4 border p-4 rounded-md">
                     <h4 className="font-semibold">Contact & Location Details</h4>
                     <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground"/><span>{producer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground"/><span>{producer.contactNumber}</span>
                        </div>
                         <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5"/><span className="whitespace-pre-wrap">{producer.billingAddress}</span>
                        </div>
                     </div>
                 </div>

                {workOrders.map((wo, index) => (
                    <div key={index} className="space-y-4 border p-4 rounded-md relative">
                         <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Wine #{index + 1}</h4>
                            {workOrders.length > 1 && (
                            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7 absolute top-1 right-1" onClick={() => removeWorkOrder(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            )}
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor={`cultivar-${index}`}>Cultivar</Label>
                                <Select onValueChange={(v) => handleWorkOrderChange(index, 'cultivar', v)}>
                                    <SelectTrigger id={`cultivar-${index}`}><SelectValue placeholder="Select a cultivar" /></SelectTrigger>
                                    <SelectContent>{southAfricanCultivars.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`vintage-${index}`}>Vintage</Label>
                                <Select onValueChange={(v) => handleWorkOrderChange(index, 'vintage', v)}>
                                    <SelectTrigger id={`vintage-${index}`}><SelectValue placeholder="Select a vintage" /></SelectTrigger>
                                    <SelectContent>{vintageYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor={`volumeLiters-${index}`}>Volume (Litres)</Label>
                                <Input id={`volumeLiters-${index}`} type="number" required value={wo.volumeLiters || ''} onChange={(e) => handleWorkOrderChange(index, 'volumeLiters', parseInt(e.target.value, 10) || 0)} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`equivalentBottles-${index}`}>Equivalent 750ml Bottles</Label>
                                <Input id={`equivalentBottles-${index}`} type="text" readOnly value={(wo.equivalentBottles || 0).toLocaleString()} className="bg-muted" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor={`bottleType-${index}`}>Bottle Type</Label>
                            <Select onValueChange={(v) => handleWorkOrderChange(index, 'bottleType', v)}>
                                <SelectTrigger id={`bottleType-${index}`}><SelectValue placeholder="Select a bottle type" /></SelectTrigger>
                                <SelectContent>{bottleTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor={`closureType-${index}`}>Closure Type</Label>
                            <Select onValueChange={(v) => handleWorkOrderChange(index, 'closureType', v)}>
                                <SelectTrigger><SelectValue placeholder="Select a closure type" /></SelectTrigger>
                                <SelectContent>{['Cork', 'Screwcap', 'Crown cap', 'Stelvin Lux', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>

                         {service === 'Mobile Bottling' && (
                            <div className="space-y-1">
                                <Label htmlFor={`filtrationType-${index}`}>Filtration Type</Label>
                                <Select onValueChange={(v) => handleWorkOrderChange(index, 'filtrationType', v)} required>
                                    <SelectTrigger id={`filtrationType-${index}`}>
                                        <SelectValue placeholder="Select a filtration type..." />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                                        {filtrationOptions?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-1">
                            <Label htmlFor={`specialInstructions-${index}`}>Special Instructions</Label>
                            <Textarea id={`specialInstructions-${index}`} onChange={(e) => handleWorkOrderChange(index, 'specialInstructions', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>

            <Button type="button" variant="outline" onClick={addWorkOrder}><PlusCircle className="mr-2 h-4 w-4" /> Add Another Wine</Button>

            <SheetFooter className="mt-6 pt-4 border-t">
                <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                <SubmitButton />
            </SheetFooter>
        </form>
    )
}
