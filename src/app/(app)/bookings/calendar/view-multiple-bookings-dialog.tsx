
'use client';

import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Booking } from '@/lib/booking-actions';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViewMultipleBookingsDialogProps {
    bookings: Booking[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onManageBooking: (booking: Booking) => void;
}

export function ViewMultipleBookingsDialog({ bookings, open, onOpenChange, onManageBooking }: ViewMultipleBookingsDialogProps) {
    if (bookings.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bookings for {format(new Date(bookings[0].date), 'PPP')}</DialogTitle>
                    <DialogDescription>Multiple bookings exist for this date.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-4 pr-6">
                        {bookings.map(booking => (
                            <div key={booking.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{booking.producerCompany}</p>
                                        <p className="text-sm text-muted-foreground">{booking.workOrders.map(wo => wo.service).join(', ')}</p>
                                    </div>
                                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                                        {booking.status}
                                    </Badge>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button size="sm" onClick={() => onManageBooking(booking)}>
                                        Manage
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                     <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    