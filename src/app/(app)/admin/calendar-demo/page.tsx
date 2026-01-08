
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, addHours, startOfHour } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, User, Phone, MapPin, Bot, Edit, Trash2, CalendarClock, List, Package, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { getSupplierBookings, type Booking, updateBookingStatus, type WorkOrder, createManualBooking } from '@/lib/booking-actions';
import { getMachines, type Machine } from '@/lib/machine-actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { EditBookingForm } from '@/app/(app)/bookings/calendar/edit-booking-form';
import { DeleteBookingDialog } from '@/app/(app)/bookings/calendar/delete-booking-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewBookingDialog } from '@/app/(app)/bookings/calendar/view-booking-dialog';
import { ViewMultipleBookingsDialog } from '@/app/(app)/bookings/calendar/view-multiple-bookings-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 7}:00`); // 7am to 6pm

function CalendarView({ service, bookings, machines, onDateClick, onBookingUpdate, onManageBookingFromList, onAddManualBooking }: {
    service: 'Mobile Bottling' | 'Mobile Labelling';
    bookings: Booking[];
    machines: Machine[];
    onDateClick: (date: Date) => void;
    onBookingUpdate: () => void;
    onManageBookingFromList: (booking: Booking) => void;
    onAddManualBooking: (service: 'Mobile Bottling' | 'Mobile Labelling') => void;
}) {
    const [month, setMonth] = useState(new Date());

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
                        onMonthChange={setMonth}
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /> Run Sheet</CardTitle>
                    <CardDescription>New {service.split(' ')[1].toLowerCase()} requests requiring action.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map(booking => (
                            <div key={booking.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted" onClick={() => { setMonth(new Date(booking.date)); onManageBookingFromList(booking); }}>
                                <p className="font-semibold">{booking.producerCompany}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(booking.date), 'PPP')}</p>
                                <Separator className="my-2" />
                                <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); onManageBookingFromList(booking); }}>Manage</Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <Package className="mx-auto h-12 w-12" />
                            <p className="mt-2">No pending {service.split(' ')[1].toLowerCase()} requests.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


export default function AdminDayViewDemoPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [bookingsOnSelectedDate, setBookingsOnSelectedDate] = useState<Booking[]>([]);
    const [isMultiBookingDialogOpen, setIsMultiBookingDialogOpen] = useState(false);
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
        setIsSheetOpen(false);

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
        const dateString = day.toISOString().split('T')[0];
        const bookingsForDay = bookings.filter(b => b.date.startsWith(dateString));

        if (bookingsForDay.length === 0) return;

        if (bookingsForDay.length > 1) {
            setBookingsOnSelectedDate(bookingsForDay);
            setIsMultiBookingDialogOpen(true);
        } else {
            const singleBooking = bookingsForDay[0];
            setSelectedBooking(singleBooking);
            if (singleBooking.status === 'pending') {
                setIsSheetOpen(true);
            } else {
                setIsDetailsDialogOpen(true);
            }
        }
    }
    
    const handleManageBookingFromList = (booking: Booking) => {
        setSelectedBooking(booking);
        if (booking.status === 'pending') {
            setIsSheetOpen(true);
        } else {
            setIsDetailsDialogOpen(true);
        }
        if (isMultiBookingDialogOpen) {
            setIsMultiBookingDialogOpen(false);
        }
    };

    const handleOnUpdateSuccess = () => {
        setIsSheetOpen(false);
        setIsDetailsDialogOpen(false);
        fetchAndSetData();
    }
    
    if (isLoading) {
        return <CalendarSkeleton />;
    }

    const availableMachinesForSelectedBooking = machines.filter(m => selectedBooking?.workOrders.some(wo => wo.service.replace('Mobile ', '') === m.type));

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
                <TabsContent value="bottling">
                    <CalendarView 
                        service="Mobile Bottling"
                        bookings={bookings}
                        machines={machines}
                        onDateClick={handleDateClick}
                        onBookingUpdate={fetchAndSetData}
                        onManageBookingFromList={handleManageBookingFromList}
                        onAddManualBooking={() => {}}
                    />
                </TabsContent>
                <TabsContent value="labelling">
                     <CalendarView 
                        service="Mobile Labelling"
                        bookings={bookings}
                        machines={machines}
                        onDateClick={handleDateClick}
                        onBookingUpdate={fetchAndSetData}
                        onManageBookingFromList={handleManageBookingFromList}
                        onAddManualBooking={() => {}}
                    />
                </TabsContent>
            </Tabs>
            

            {selectedBooking && <ViewBookingDialog 
                booking={selectedBooking} 
                machines={machines}
                open={isDetailsDialogOpen} 
                onOpenChange={setIsDetailsDialogOpen} 
                onSuccess={handleOnUpdateSuccess}
            />}

            {bookingsOnSelectedDate.length > 0 && (
                <ViewMultipleBookingsDialog
                    bookings={bookingsOnSelectedDate}
                    open={isMultiBookingDialogOpen}
                    onOpenChange={setIsMultiBookingDialogOpen}
                    onManageBooking={handleManageBookingFromList}
                />
            )}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Manage Booking Request</SheetTitle>
                        {selectedBooking && <SheetDescription>From: {selectedBooking.producerCompany} for {format(new Date(selectedBooking.date), 'PPP')}</SheetDescription>}
                    </SheetHeader>
                    {selectedBooking && (
                        <>
                            <div className="py-4 space-y-6 overflow-y-auto pr-4 flex-grow">
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
                                                {workOrder.filtrationType && <p><strong className="w-24 inline-block">Filtration:</strong> {workOrder.filtrationType}</p>}
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

                            <div className="mt-auto pt-4 border-t space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Actions</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="destructive" onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')}><X className="mr-2 h-4 w-4" />Reject</Button>
                                        <Button variant="default" onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')} className="bg-green-600 hover:bg-green-700"><Check className="mr-2 h-4 w-4" />Accept</Button>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Advanced</h4>
                                    <div className="flex gap-2">
                                        <EditBookingForm booking={selectedBooking} machines={machines} onSuccess={handleOnUpdateSuccess} />
                                        <DeleteBookingDialog booking={selectedBooking} onSuccess={handleOnUpdateSuccess} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
