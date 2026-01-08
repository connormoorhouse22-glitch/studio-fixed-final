
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { format, addHours, startOfHour } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, User, Phone, MapPin, Bot, Edit, Trash2, CalendarClock, Package, PlusCircle, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { getSupplierBookings, type Booking, updateBookingStatus, type WorkOrder, createManualBooking } from '@/lib/booking-actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getUsers, type User as Offender } from '@/lib/userActions';
import { addOffender, getOffenders } from '@/app/(app)/admin/red-flag-zone/actions';
import { addDays, subDays } from 'date-fns';
import { getMachines, type Machine } from '@/lib/machine-actions';


function DayViewSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-80 mt-2" />
            </div>
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-12 w-20" />
                                <Skeleton className="h-12 flex-1" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 7}:00`); // 7am to 6pm

export default function AdminDayViewDemoPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [date, setDate] = useState(new Date());

    const fetchAndSetData = useCallback(async () => {
        setIsLoading(true);
        const providerCompany = 'WineServ'; // Hardcoded for demo
        const [bookingData, machineData] = await Promise.all([
            getSupplierBookings(providerCompany),
            getMachines(providerCompany)
        ]);
        setBookings(bookingData);
        setMachines(machineData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAndSetData();
    }, [fetchAndSetData]);

    const bookingsForDay = useMemo(() => {
        const dateString = date.toISOString().split('T')[0];
        return bookings.filter(b => b.date.startsWith(dateString));
    }, [bookings, date]);
    
    const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'rejected') => {
       // Demo action
       toast({ title: 'Action Disabled', description: 'Status updates are disabled in this demo view.' });
    };

    const handleManageBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsSheetOpen(true);
    };

    if (isLoading) {
        return <DayViewSkeleton />;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Day View Demo</h2>
                <p className="text-muted-foreground">
                    An hourly schedule of all confirmed bookings for a selected day.
                </p>
            </div>

            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setDate(subDays(date, 1))}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous Day
                </Button>
                <h3 className="text-xl font-semibold">{format(date, 'PPP')}</h3>
                <Button variant="outline" onClick={() => setDate(addDays(date, 1))}>
                    Next Day <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Hourly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        {timeSlots.map(slot => {
                            const bookingsInSlot = bookingsForDay.filter(b => b.status === 'confirmed'); // Only show confirmed
                            const slotHour = parseInt(slot.split(':')[0]);

                            return (
                                <div key={slot} className="flex items-start gap-4 border-b py-4">
                                    <div className="w-20 text-right pr-4 flex-shrink-0">
                                        <p className="font-semibold text-sm">{slot}</p>
                                    </div>
                                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {bookingsInSlot.map(booking => (
                                             <div key={booking.id} className="p-2 border rounded-lg bg-green-50 border-green-200 cursor-pointer hover:bg-green-100" onClick={() => handleManageBooking(booking)}>
                                                <p className="font-semibold text-green-900">{booking.producerCompany}</p>
                                                <p className="text-xs text-green-700">{booking.workOrders.map(wo => wo.service).join(', ')}</p>
                                            </div>
                                        ))}
                                        {bookingsInSlot.length === 0 && <div className="h-8"></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Booking Details</SheetTitle>
                        {selectedBooking && <SheetDescription>From: {selectedBooking.producerCompany} for {format(new Date(selectedBooking.date), 'PPP')}</SheetDescription>}
                    </SheetHeader>
                    {selectedBooking && (
                        <div className="py-4 space-y-6 overflow-y-auto pr-4 flex-grow">
                             <div className="p-4 border rounded-lg bg-background space-y-2">
                                <h4 className="font-semibold">Producer Details</h4>
                                <div className="text-sm space-y-1 text-muted-foreground">
                                    <p className="flex items-center"><User className="h-4 w-4 mr-2"/> {selectedBooking.workOrders[0]?.contactPerson}</p>
                                    <p className="flex items-center"><Phone className="h-4 w-4 mr-2"/> {selectedBooking.workOrders[0]?.contactNumber}</p>
                                    <p className="flex items-center"><MapPin className="h-4 w-4 mr-2"/> {selectedBooking.workOrders[0]?.location}</p>
                                </div>
                            </div>
                            {selectedBooking.workOrders.map((workOrder, index) => (
                               <div key={index} className="p-4 border rounded-lg bg-muted/50 space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold">Work Order #{index + 1}</h4>
                                        <div className="text-sm space-y-1 text-muted-foreground">
                                            <p><strong className="w-24 inline-block">Service:</strong> {workOrder.service}</p>
                                            {workOrder.filtrationType && <p><strong className="w-24 inline-block">Filtration:</strong> {workOrder.filtrationType}</p>}
                                            <p><strong className="w-24 inline-block">Assigned Machine:</strong> {machines.find(m => m.id === selectedBooking?.assignedMachineId)?.name || 'Not Assigned'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
