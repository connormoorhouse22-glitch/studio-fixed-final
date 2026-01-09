
'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getSupplierBookings, getProducerBookings, type Booking } from '@/lib/booking-actions';
import { BookingForm } from '../booking-form';
import { CalendarDays, Bot, DoorOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/users';
import { getUserByEmail, getFiltrationOptions, getSuppliersByService } from '@/lib/userActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getMachines, type Machine } from '@/lib/machine-actions';

export default function ProducerBookingPage() {
    const params = useParams();
    const supplierName = decodeURIComponent(params.supplierName as string);
    
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [myBookingsWithSupplier, setMyBookingsWithSupplier] = useState<Booking[]>([]);
    const [filtrationOptions, setFiltrationOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [producer, setProducer] = useState<User | null>(null);
    const [meetingRoomProviders, setMeetingRoomProviders] = useState<User[]>([]);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
    
    const [viewedBooking, setViewedBooking] = useState<Booking | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    const serviceType = useMemo(() => {
        if (typeof window === 'undefined') return 'Mobile Bottling';
        const searchParams = new URLSearchParams(window.location.search);
        return (searchParams.get('service') as 'Mobile Bottling' | 'Mobile Labelling' | 'Meeting Room') || 'Mobile Bottling';
    }, [typeof window !== 'undefined' ? window.location.search : '']);

    const fetchData = useCallback(async (email: string) => {
        setIsLoading(true);
        const [supplierBookings, producerBookingsForSupplier, userData, machineData, roomProviders, fetchedFiltrationOptions] = await Promise.all([
            getSupplierBookings(supplierName),
            getProducerBookings(email, supplierName),
            getUserByEmail(email),
            getMachines(supplierName),
            getSuppliersByService('Meeting Room'),
            getFiltrationOptions(supplierName)
        ]);

        setAllBookings(supplierBookings);
        setMachines(machineData);
        setMyBookingsWithSupplier(producerBookingsForSupplier);
        setProducer(userData);
        setMeetingRoomProviders(roomProviders);
        setFiltrationOptions(fetchedFiltrationOptions);
        setIsLoading(false);
    }, [supplierName]);

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (email) {
            fetchData(email);
        } else {
            setIsLoading(false);
        }
    }, [fetchData]);

    const { ownConfirmedBookings, ownPendingBookings, unavailableDates } = useMemo(() => {
        if (!producer?.email || !serviceType) return { ownConfirmedBookings: [], ownPendingBookings: [], unavailableDates: [] };

        const ownConfirmed = myBookingsWithSupplier
            .filter(b => b.status === 'confirmed')
            .map(b => new Date(b.date));
            
        const ownPending = myBookingsWithSupplier
            .filter(b => b.status === 'pending')
            .map(b => new Date(b.date));
        
        let fullyBookedDates: Date[] = [];
        if (serviceType === 'Meeting Room') {
            const bookingsByDate = new Map<string, number>();
            allBookings.forEach(booking => {
                 if (booking.status === 'confirmed' && booking.workOrders.some(wo => wo.service === serviceType)) {
                    const dateKey = booking.date.split('T')[0];
                    bookingsByDate.set(dateKey, (bookingsByDate.get(dateKey) || 0) + 1);
                }
            });
            const providerHasMeetingRoom = meetingRoomProviders.some(p => p.company === supplierName);
            for (const [date, count] of bookingsByDate.entries()) {
                 if (providerHasMeetingRoom && count >= 1) {
                    fullyBookedDates.push(new Date(date + 'T00:00:00'));
                }
            }
        } else {
            const machineTypeForService = serviceType === 'Mobile Bottling' ? 'Bottling' : 'Labelling';
            const totalAvailableMachines = machines.filter(m => m.type === machineTypeForService).length;

            const bookingsByDate = new Map<string, number>();
            allBookings.forEach(booking => {
                if (booking.status === 'confirmed' && booking.workOrders.some(wo => wo.service === serviceType)) {
                    const dateKey = booking.date.split('T')[0];
                    bookingsByDate.set(dateKey, (bookingsByDate.get(dateKey) || 0) + 1);
                }
            });
            
            for (const [date, count] of bookingsByDate.entries()) {
                if (count >= totalAvailableMachines) {
                    fullyBookedDates.push(new Date(date + 'T00:00:00'));
                }
            }
        }
            
        return { ownConfirmedBookings: ownConfirmed, ownPendingBookings: ownPending, unavailableDates: fullyBookedDates };
    }, [allBookings, myBookingsWithSupplier, producer?.email, machines, serviceType, meetingRoomProviders, supplierName]);


    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setIsBookingSheetOpen(true);
        }
    };
    
    const onBookingSuccess = () => {
        setIsBookingSheetOpen(false);
        if(producer?.email) {
           fetchData(producer.email);
        }
    }
    
    const handleViewDetails = (booking: Booking) => {
        setViewedBooking(booking);
        setIsDetailsDialogOpen(true);
    }

    const disabledDays = useMemo(() => {
        return [{ before: new Date() }, ...unavailableDates];
    }, [unavailableDates]);

    const calendarModifiers = {
        ownBooking: ownConfirmedBookings,
        ownPending: ownPendingBookings,
        unavailable: unavailableDates,
    };

    const calendarModifierStyles = {
        ownBooking: { 
            backgroundColor: '#22c55e', 
            color: 'hsl(var(--primary-foreground))',
        },
        ownPending: {
            backgroundColor: '#f59e0b', 
            color: 'hsl(var(--accent-foreground))',
        },
        unavailable: { 
            backgroundColor: '#2563eb', 
            color: 'hsl(var(--primary-foreground))',
            opacity: 1,
        },
    };
    
    if (isLoading) {
        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
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

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">Book a Service with {supplierName}</h2>
                    <p className="text-muted-foreground">Select an available date on the calendar to make a booking request for: <span className="font-semibold">{serviceType}</span></p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                     <CardContent className="p-4 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={disabledDays}
                            modifiers={calendarModifiers}
                            modifiersStyles={calendarModifierStyles}
                        />
                    </CardContent>
                        <CardContent>
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2 border bg-background" />Available</div>
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={calendarModifierStyles.ownBooking} />Your Confirmed Booking</div>
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={calendarModifierStyles.ownPending} />Your Pending Request</div>
                            <div className="flex items-center"><div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#2563eb'}} />Unavailable</div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>My Bookings</CardTitle>
                        <CardDescription>Your booking requests with {supplierName}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {myBookingsWithSupplier.length > 0 ? (
                             myBookingsWithSupplier.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(booking => (
                                <div key={booking.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(booking)}>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{format(new Date(booking.date), 'PPP')}</p>
                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>{booking.status}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{booking.workOrders.map(wo => wo.service).join(', ')}</p>
                                </div>
                             ))
                        ) : (
                             <div className="text-center text-muted-foreground py-10">
                                {serviceType === 'Meeting Room' ? <DoorOpen className="mx-auto h-12 w-12" /> : <Bot className="mx-auto h-12 w-12" />}
                                <p className="mt-2">No bookings with this provider.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>New Booking Request</SheetTitle>
                        <SheetDescription>
                            Confirm details for your booking on <span className="font-semibold">{selectedDate ? format(selectedDate, 'PPP') : ''}</span> with {supplierName}.
                        </SheetDescription>
                    </SheetHeader>
                    {selectedDate && producer && (
                        <BookingForm
                            selectedDate={selectedDate}
                            providerCompany={supplierName}
                            filtrationOptions={filtrationOptions || []}
                            service={serviceType}
                            producer={producer}
                            onSuccess={onBookingSuccess}
                        />
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Work Order Details</DialogTitle>
                        <DialogDescription>
                            Details for your booking on {viewedBooking ? format(new Date(viewedBooking.date), 'PPP') : ''}.
                        </DialogDescription>
                    </DialogHeader>
                    {viewedBooking && (
                         <div className="space-y-4 py-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
                            <div className="flex items-center gap-4">
                                <Badge variant={viewedBooking.status === 'confirmed' ? 'default' : 'secondary'} className={viewedBooking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>{viewedBooking.status}</Badge>
                            </div>

                            {viewedBooking.workOrders.map((workOrder, index) => (
                                <div key={index}>
                                    <Separator className="my-4" />
                                    <h4 className="font-semibold text-base mb-4">Work Order #{index + 1}</h4>
                                    <div className="grid grid-cols-1 gap-y-3">
                                        <p><strong className="w-24 inline-block text-muted-foreground">Service:</strong> {workOrder.service}</p>
                                        {workOrder.filtrationType && <p><strong className="w-24 inline-block text-muted-foreground">Filtration:</strong> {workOrder.filtrationType}</p>}
                                        <p><strong className="w-24 inline-block text-muted-foreground">Volume:</strong> {workOrder.volumeLiters.toLocaleString()} L</p>
                                        <p><strong className="w-24 inline-block text-muted-foreground">Bottle Type:</strong> {workOrder.bottleType}</p>
                                        <p><strong className="w-24 inline-block text-muted-foreground">Closure:</strong> {workOrder.closureType}</p>
                                        <p><strong className="w-24 inline-block text-muted-foreground">Cultivar:</strong> {workOrder.cultivar}</p>
                                        <p><strong className="w-24 inline-block text-muted-foreground">Vintage:</strong> {workOrder.vintage}</p>
                                    </div>
                                    {workOrder.specialInstructions && (
                                        <>
                                            <Separator className="my-4" />
                                            <div>
                                                <p className="font-semibold mb-2">Special Instructions:</p>
                                                <p className="italic">"{workOrder.specialInstructions}"</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
// build-trigger-1767884513
// Cache-bust: 1767884900
