
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateBooking, type Booking, type BookingResponse, type WorkOrder } from '@/lib/booking-actions';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Machine } from '@/lib/machine-actions';
import type { User } from '@/lib/users';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const initialState: BookingResponse = { success: false, message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
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

interface EditBookingFormProps {
    booking: Booking;
    machines: Machine[];
    onSuccess: () => void;
}

function EditBookingFormContent({ booking, machines, onSuccess }: EditBookingFormProps) {
    const { toast } = useToast();
    const updateBookingWithId = updateBooking.bind(null, booking.id);
    const [state, formAction] = useFormState(updateBookingWithId, initialState);
    
    const [date, setDate] = useState<Date | undefined>(new Date(booking.date));
    const [workOrders, setWorkOrders] = useState<Partial<WorkOrder>[]>(booking.workOrders);
    const [assignedMachineId, setAssignedMachineId] = useState<string | undefined>(booking.assignedMachineId);
    const [provider, setProvider] = useState<User | null>(null);


    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Success!', description: state.message });
                onSuccess();
            } else {
                 toast({ variant: 'destructive', title: 'Update Failed', description: state.message });
            }
        }
    }, [state, toast, onSuccess]);
    
    useEffect(() => {
        async function fetchProvider() {
            const { getUserByCompany } = await import('@/lib/user-actions');
            const providerData = await getUserByCompany(booking.providerCompany);
            setProvider(providerData);
        }
        fetchProvider();
    }, [booking.providerCompany]);


    const currentYear = new Date().getFullYear();
    const vintageYears = Array.from({ length: 9 }, (_, i) => currentYear - i);

    const handleWorkOrderChange = (index: number, field: keyof WorkOrder, value: any) => {
        const newWorkOrders = [...workOrders];
        newWorkOrders[index] = { ...newWorkOrders[index], [field]: value };
        setWorkOrders(newWorkOrders);
    };

    const addWorkOrder = () => {
        setWorkOrders([...workOrders, { service: booking.workOrders[0].service }]);
    };

    const removeWorkOrder = (index: number) => {
        if (workOrders.length > 1) {
            setWorkOrders(workOrders.filter((_, i) => i !== index));
        }
    };
    
    const equivalentBottles = (volume: number | undefined) => {
        return volume && volume > 0 ? Math.ceil(volume / 0.75) : 0;
    }

    const availableMachines = machines.filter(m => booking.workOrders.some(wo => wo.service.replace('Mobile ', '') === m.type));


    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="date" value={date?.toISOString()} />
            <input type="hidden" name="workOrders" value={JSON.stringify(workOrders)} />
            <input type="hidden" name="assignedMachineId" value={assignedMachineId || ''} />
            
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-4">
                <div className="space-y-1">
                     <Label>Booking Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="machine-allocation" className="font-semibold">Machine Allocation</Label>
                    <Select onValueChange={setAssignedMachineId} defaultValue={assignedMachineId}>
                        <SelectTrigger id="machine-allocation">
                            <SelectValue placeholder="Select a machine..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMachines.length > 0 ? (
                                availableMachines.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-center text-sm text-muted-foreground">No matching machines found.</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {workOrders.map((wo, index) => (
                    <div key={index} className="space-y-4 border p-4 rounded-md relative">
                         <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Work Order #{index + 1}</h4>
                            {workOrders.length > 1 && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7 absolute top-1 right-1" type="button" onClick={() => removeWorkOrder(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor={`cultivar-${index}`}>Cultivar</Label>
                                <Select required defaultValue={wo.cultivar} onValueChange={(v) => handleWorkOrderChange(index, 'cultivar', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{southAfricanCultivars.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`vintage-${index}`}>Vintage</Label>
                                <Select required defaultValue={wo.vintage} onValueChange={(v) => handleWorkOrderChange(index, 'vintage', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>{vintageYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Volume (Litres)</Label>
                                <Input type="number" required defaultValue={wo.volumeLiters} onChange={(e) => handleWorkOrderChange(index, 'volumeLiters', parseInt(e.target.value, 10) || 0)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Equivalent 750ml Bottles</Label>
                                <Input type="text" readOnly value={equivalentBottles(wo.volumeLiters).toLocaleString()} className="bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Bottle Type</Label>
                            <Select required defaultValue={wo.bottleType} onValueChange={(v) => handleWorkOrderChange(index, 'bottleType', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>{bottleTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Closure Type</Label>
                            <Select required defaultValue={wo.closureType} onValueChange={(v) => handleWorkOrderChange(index, 'closureType', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cork">Cork</SelectItem>
                                    <SelectItem value="Screwcap">Screwcap</SelectItem>
                                    <SelectItem value="Crown cap">Crown cap</SelectItem>
                                    <SelectItem value="Stelvin Lux">Stelvin Lux</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {wo.service === 'Mobile Bottling' && provider?.filtrationOptions && provider.filtrationOptions.length > 0 && (
                            <div className="space-y-1">
                                <Label htmlFor={`filtrationType-${index}`}>Filtration Type</Label>
                                <Select defaultValue={wo.filtrationType} onValueChange={(v) => handleWorkOrderChange(index, 'filtrationType', v)} required>
                                    <SelectTrigger id={`filtrationType-${index}`}>
                                        <SelectValue placeholder={`Select from ${provider.company}'s options...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provider.filtrationOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label>Special Instructions</Label>
                            <Textarea defaultValue={wo.specialInstructions} onChange={(e) => handleWorkOrderChange(index, 'specialInstructions', e.target.value)} />
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={addWorkOrder}><PlusCircle className="mr-2 h-4 w-4" /> Add Another Work Order</Button>
            </div>

            <DialogFooter className="mt-4 pt-4 border-t">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
    )
}

export function EditBookingForm(props: EditBookingFormProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSuccess = () => {
        props.onSuccess();
        setIsDialogOpen(false);
    }
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                    <DialogDescription>Make changes to this booking. The producer will not be re-notified.</DialogDescription>
                </DialogHeader>
                <EditBookingFormContent {...props} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}
