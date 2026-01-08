
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Booking } from '@/lib/booking-actions';
import type { Machine } from '@/lib/machine-actions';
import { EditBookingForm } from './edit-booking-form';
import { DeleteBookingDialog } from './delete-booking-dialog';


interface ViewBookingDialogProps {
    booking: Booking;
    machines: Machine[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ViewBookingDialog({ booking, machines, open, onOpenChange, onSuccess }: ViewBookingDialogProps) {
    
    const getMachineName = (machineId?: string) => {
        return machines.find(m => m.id === machineId)?.name || 'Not Assigned';
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                        From: {booking.producerCompany} for {format(new Date(booking.date), 'PPP')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                           <p className="font-semibold">Status:</p>
                           <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>{booking.status}</Badge>
                        </div>
                         <div className="flex items-center gap-2">
                           <p className="font-semibold">Assigned Machine:</p>
                           <p>{getMachineName(booking.assignedMachineId)}</p>
                        </div>
                    </div>

                    {booking.workOrders.map((workOrder, index) => (
                        <div key={index}>
                            <Separator className="my-4" />
                            <h4 className="font-semibold text-base mb-4">Work Order #{index + 1}</h4>
                            <div className="grid grid-cols-1 gap-y-3">
                                <p><strong className="w-32 inline-block text-muted-foreground">Service:</strong> {workOrder.service}</p>
                                {workOrder.filtrationType && (
                                  <p><strong className="w-32 inline-block text-muted-foreground">Filtration:</strong> {workOrder.filtrationType}</p>
                                )}
                                <p><strong className="w-32 inline-block text-muted-foreground">Cultivar:</strong> {workOrder.cultivar}</p>
                                <p><strong className="w-32 inline-block text-muted-foreground">Vintage:</strong> {workOrder.vintage}</p>
                                <p><strong className="w-32 inline-block text-muted-foreground">Volume:</strong> {workOrder.volumeLiters.toLocaleString()} L</p>
                                <p><strong className="w-32 inline-block text-muted-foreground">Bottle Type:</strong> {workOrder.bottleType}</p>
                                <p><strong className="w-32 inline-block text-muted-foreground">Closure:</strong> {workOrder.closureType}</p>
                            </div>
                            {workOrder.specialInstructions && (
                                <>
                                    <Separator className="my-2" />
                                    <div>
                                        <p className="font-semibold mb-2 text-muted-foreground">Special Instructions:</p>
                                        <p className="italic">"{workOrder.specialInstructions}"</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                <DialogFooter className="justify-between">
                    <div>
                         <DeleteBookingDialog booking={booking} onSuccess={onSuccess} />
                    </div>
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                        <EditBookingForm booking={booking} machines={machines} onSuccess={onSuccess} />
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
