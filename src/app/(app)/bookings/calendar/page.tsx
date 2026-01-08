
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, User, Phone, MapPin, Edit, Trash2, List, Clock, ArrowLeft, ArrowRight, PlusCircle } from 'lucide-react';
import { getSupplierBookings, type Booking, updateBookingStatus, type WorkOrder } from '@/lib/booking-actions';
import { getMachines, type Machine } from '@/lib/machine-actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EditBookingForm } from '@/app/(app)/bookings/calendar/edit-booking-form';
import { DeleteBookingDialog } from '@/app/(app)/bookings/calendar/delete-booking-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewBookingDialog } from '@/app/(app)/bookings/calendar/view-booking-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManualBookingForm } from './manual-booking-form';


function CalendarSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 flex justify-center">
                    <Skeleton className="h-[300px] w-full max-w-md" />
                </CardContent>
                <CardContent>
                    <Skeleton className="h-6 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}


function CalendarView({ service, bookings, onDateClick, month, onMonthChange }: {
    service: 'Mobile Bottling' | 'Mobile Labelling';
    bookings: Booking[];
    onDateClick: (date: Date) => void;
    month: Date;
    onMonthChange: (date: Date) => void;
}) {

    const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending' && b.workOrders.some(wo => wo.service === service)), [bookings, service]);
    const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed' && b.workOrders.some(wo => wo.service === service)), [bookings, service]);

    const calendarModifiers = {
        confirmed: confirmedBookings.map(b => new Date(b.date)),
        pending: pendingBookings.map(b => new Date(b.date)),
    };

    const calendarModifierStyles = {
        confirmed: { backgroundColor: '#22c55e', color: 'hsl(var(--primary-foreground))' },
        pending: { backgroundColor: '#f59e0b', color: 'hsl(var(--accent-foreground))' },
    };

    return (
        <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{service} Calendar</CardTitle>
                        <CardDescription>Overview of scheduled and requested dates.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        month={month}
                        onMonthChange={onMonthChange}
                        onDayClick={onDateClick}
                        modifiers={calendarModifiers}
                        modifiersStyles={calendarModifierStyles}
                        className="p-0"
                    />
                </CardContent>
                <CardFooter>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2 border bg-background" />Available</div>
                        <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={calendarModifierStyles.confirmed} />Confirmed</div>
                        <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={calendarModifierStyles.pending} />Pending</div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}


export default function ServiceProviderBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [assignedMachineId, setAssignedMachineId] = useState<string | undefined>(undefined);
    const [date, setDate] = useState(new Date());
    
    const fetchAndSetData = useCallback(async () => {
        setIsLoading(true);
        const providerCompany = localStorage.getItem('userCompany');
        if (providerCompany) {
            const [bookingData, machineData] = await Promise.all([
                getSupplierBookings(providerCompany),
                getMachines(providerCompany)
            ]);
            setBookings(bookingData);
            setMachines(machineData);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAndSetData();
    }, [fetchAndSetData]);
    
    useEffect(() => {
        if (selectedBooking) {
            setAssignedMachineId(selectedBooking.assignedMachineId);
        }
    }, [selectedBooking]);

    const bookingsForDay = useMemo(() => {
        const dateString = date.toISOString().split('T')[0];
        return bookings.filter(b => b.date.startsWith(dateString));
    }, [bookings, date]);

    const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'rejected') => {
        if (newStatus === 'confirmed' && !assignedMachineId) {
            toast({
                variant: 'destructive',
                title: 'Machine Required',
                description: 'Please allocate a machine before confirming the booking.',
            });
            return;
        }

        const originalBookings = [...bookings];
        const optimisticBooking = originalBookings.find(b => b.id === bookingId);
        
        if (optimisticBooking) {
            const updatedBooking = { ...optimisticBooking, status: newStatus, assignedMachineId: assignedMachineId };
            setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
        }
        setIsManageDialogOpen(false);

        const result = await updateBookingStatus(bookingId, newStatus, assignedMachineId);
        if (result.success) {
            toast({
                title: 'Booking Updated',
                description: `Booking from ${originalBookings.find(b=>b.id === bookingId)?.producerCompany} has been ${newStatus}.`,
            });
            await fetchAndSetData();
        } else {
            setBookings(originalBookings);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: result.message,
            });
        }
    };


    const handleDateClick = (day: Date) => {
        setDate(day);
    }
    
    const handleManageBookingFromList = (booking: Booking) => {
        setSelectedBooking(booking);
        if (booking.status === 'pending') {
            setIsManageDialogOpen(true);
        } else {
            setIsDetailsDialogOpen(true);
        }
    };

    const handleOnUpdateSuccess = () => {
        setIsManageDialogOpen(false);
        setIsDetailsDialogOpen(false);
        setIsManualEntryOpen(false);
        fetchAndSetData();
    }
    
    if (isLoading) {
        return <CalendarSkeleton />;
    }

    const getStatusVariant = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return 'default';
            case 'pending': return 'secondary';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    }

    const getStatusClassName = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            default: return '';
        }
    }

    const availableMachinesForSelectedBooking = machines.filter(m => selectedBooking?.workOrders.some(wo => wo.service.replace('Mobile ', '') === m.type));

    const renderDailySchedule = (service: 'Mobile Bottling' | 'Mobile Labelling') => {
        const dailyBookings = bookingsForDay.filter(b => b.workOrders.some(wo => wo.service === service));
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /> Daily Schedule</CardTitle>
                            <CardDescription>{format(date, 'PPP')}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="secondary" onClick={() => setIsManualEntryOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Manual Entry</Button>
                            <Button variant="outline" size="icon" onClick={() => setDate(subDays(date, 1))}><ArrowLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, 1))}><ArrowRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {dailyBookings.length > 0 ? (
                        dailyBookings.map(booking => (
                            <div key={booking.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => handleManageBookingFromList(booking)}>
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold">{booking.producerCompany}</p>
                                    <Badge variant={getStatusVariant(booking.status)} className={getStatusClassName(booking.status)}>{booking.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{booking.workOrders.map(wo => wo.service).join(', ')}</p>
                                <Separator className="my-2" />
                                <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleManageBookingFromList(booking); }}>Manage</Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <Clock className="mx-auto h-12 w-12" />
                            <p className="mt-2">No bookings for this day.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    };


    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Bookings Calendar</h2>
                <p className="text-muted-foreground">
                    View all upcoming bookings and manage new requests from producers.
                </p>
            </div>
            <Tabs defaultValue="bottling" className="w-full">
                <TabsList>
                    <TabsTrigger value="bottling">Bottling Calendar</TabsTrigger>
                    <TabsTrigger value="labelling">Labelling Calendar</TabsTrigger>
                </TabsList>
                <TabsContent value="bottling" className="space-y-8">
                    <CalendarView 
                        service="Mobile Bottling"
                        bookings={bookings}
                        onDateClick={handleDateClick}
                        month={date}
                        onMonthChange={setDate}
                    />
                    {renderDailySchedule("Mobile Bottling")}
                </TabsContent>
                <TabsContent value="labelling" className="space-y-8">
                    <CalendarView 
                        service="Mobile Labelling"
                        bookings={bookings}
                        onDateClick={handleDateClick}
                        month={date}
                        onMonthChange={setDate}
                    />
                    {renderDailySchedule("Mobile Labelling")}
                </TabsContent>
            </Tabs>
            

            {selectedBooking && <ViewBookingDialog 
                booking={selectedBooking} 
                machines={machines}
                open={isDetailsDialogOpen} 
                onOpenChange={setIsDetailsDialogOpen} 
                onSuccess={handleOnUpdateSuccess}
            />}
            
             <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create Manual Booking</DialogTitle>
                        <DialogDescription>
                            Log an offline or direct booking to block out your calendar. This will not send a notification.
                        </DialogDescription>
                    </DialogHeader>
                    <ManualBookingForm selectedDate={date} machines={machines} onSuccess={handleOnUpdateSuccess} />
                </DialogContent>
            </Dialog>

            <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Booking Request</DialogTitle>
                        {selectedBooking && <DialogDescription>From: {selectedBooking.producerCompany} for {format(new Date(selectedBooking.date), 'PPP')}</DialogDescription>}
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="max-h-[70vh] overflow-y-auto pr-4 py-4 space-y-6">
                            <div className="p-4 border rounded-lg bg-background space-y-2">
                                <h4 className="font-semibold">Producer Details</h4>
                                <div className="text-sm space-y-1 text-muted-foreground">
                                    <p className="flex items-center"><User className="h-4 w-4 mr-2"/> {selectedBooking.workOrders[0]?.contactPerson}</p>
                                    <p className="flex items-center"><Phone className="h-4 w-4 mr-2"/> {selectedBooking.workOrders[0]?.contactNumber}</p>
                                    <p className="flex items-center"><MapPin className="h-4 w-4 mr-2"/> {selectedBooking.workOrders[0]?.location}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="machine-allocation" className="font-semibold">Machine Allocation</Label>
                                <Select onValueChange={setAssignedMachineId} defaultValue={assignedMachineId}>
                                    <SelectTrigger id="machine-allocation">
                                        <SelectValue placeholder="Select a machine..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMachinesForSelectedBooking.length > 0 ? (
                                            availableMachinesForSelectedBooking.map(m => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-muted-foreground">No matching machines found for this service.</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                            {selectedBooking.workOrders.map((workOrder, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Work Order #{index + 1}</h4>
                                        <div className="text-sm space-y-1 text-muted-foreground">
                                            <p><strong className="w-24 inline-block">Service:</strong> {workOrder.service}</p>
                                            {workOrder.filtrationType && (
                                                <p><strong className="w-24 inline-block">Filtration:</strong> {workOrder.filtrationType}</p>
                                            )}
                                            <p><strong className="w-24 inline-block">Cultivar:</strong> {workOrder.cultivar}</p>
                                            <p><strong className="w-24 inline-block">Vintage:</strong> {workOrder.vintage}</p>
                                            <p><strong className="w-24 inline-block">Volume:</strong> {workOrder.volumeLiters.toLocaleString()} L</p>
                                            <p><strong className="w-24 inline-block">Bottle Type:</strong> {workOrder.bottleType}</p>
                                            <p><strong className="w-24 inline-block">Closure:</strong> {workOrder.closureType}</p>
                                        </div>
                                    </div>
                                    {workOrder.specialInstructions && (
                                        <>
                                        <Separator className="my-2" />
                                        <div className="space-y-2">
                                            <h4 className="font-semibold">Special Instructions</h4>
                                            <p className="text-sm text-muted-foreground italic">"{workOrder.specialInstructions}"</p>
                                        </div>
                                        </>
                                    )}
                                </div>
                                )
                            )}
                        </div>
                    )}
                     <DialogFooter>
                        {selectedBooking && selectedBooking.status === 'pending' && (
                             <div className="flex-1 grid grid-cols-2 gap-2">
                                <Button variant="destructive" onClick={() => handleStatusUpdate(selectedBooking!.id, 'rejected')}><X className="mr-2 h-4 w-4" />Reject</Button>
                                <Button variant="default" onClick={() => handleStatusUpdate(selectedBooking!.id, 'confirmed')} className="bg-green-600 hover:bg-green-700"><Check className="mr-2 h-4 w-4" />Accept</Button>
                            </div>
                        )}
                        <div className="flex gap-2">
                             {selectedBooking && (
                                 <>
                                <EditBookingForm booking={selectedBooking} machines={machines} onSuccess={handleOnUpdateSuccess} />
                                <DeleteBookingDialog booking={selectedBooking} onSuccess={handleOnUpdateSuccess} />
                                </>
                             )}
                        </div>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
