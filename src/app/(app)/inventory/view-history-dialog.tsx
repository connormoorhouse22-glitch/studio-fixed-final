
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { getStockLogs, type StockLog } from '@/lib/stock-actions';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

function HistorySkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>
            ))}
        </div>
    )
}

interface ViewHistoryDialogProps {
    stockItemId: string;
}

export function ViewHistoryDialog({ stockItemId }: ViewHistoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [logs, setLogs] = useState<StockLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            getStockLogs(stockItemId).then(data => {
                setLogs(data);
                setIsLoading(false);
            });
        }
    }, [open, stockItemId]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={e => e.preventDefault()}>View History</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Stock Movement History</DialogTitle>
                    <DialogDescription>A log of all additions and consumptions for this item.</DialogDescription>
                </DialogHeader>
                 <ScrollArea className="flex-1">
                    <div className="pr-6 space-y-4">
                        {isLoading ? <HistorySkeleton /> : logs.length > 0 ? (
                           logs.slice().reverse().map(log => (
                                <div key={log.id} className="flex justify-between items-start border-b pb-3">
                                    <div>
                                        <p className="font-semibold text-sm">
                                            <Badge variant={log.change > 0 ? "default" : "secondary"} className={log.change > 0 ? 'bg-green-500' : ''}>
                                                {log.change > 0 ? '+' : ''}{log.change.toLocaleString()}
                                            </Badge>
                                             <span className="ml-2">{log.type}</span>
                                        </p>
                                        {log.notes && <p className="text-xs text-muted-foreground italic mt-1">"{log.notes}"</p>}
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                        <p>{format(new Date(log.timestamp), 'PPP')}</p>
                                        <p>{format(new Date(log.timestamp), 'p')}</p>
                                        <p className="font-medium text-foreground mt-1">New Total: {log.newQuantity.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No history found for this item.</p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
