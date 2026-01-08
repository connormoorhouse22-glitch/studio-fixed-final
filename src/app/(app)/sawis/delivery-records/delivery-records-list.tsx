
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDown, Wine } from 'lucide-react';
import { type DeliveryRecord } from '@/lib/delivery-record-actions';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';

function RecordsListSkeleton() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border-b">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-1/4" />
                </div>
            ))}
        </div>
    )
}

interface DeliveryRecordsListProps {
    initialRecords: DeliveryRecord[];
}

export function DeliveryRecordsList({ initialRecords }: DeliveryRecordsListProps) {
    const [records, setRecords] = useState<DeliveryRecord[]>(initialRecords);
    const [isLoading, setIsLoading] = useState(false);

    if (isLoading) {
        return <RecordsListSkeleton />;
    }

    return (
        <div>
            {records.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                    <Wine className="mx-auto h-12 w-12" />
                    <p className="mt-4">You have no delivery records yet.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Record #</TableHead>
                            <TableHead>Wine</TableHead>
                            <TableHead>Consignee</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map(record => (
                            <TableRow key={record.id}>
                                <TableCell className="font-mono">{record.deliveryRecordNo}</TableCell>
                                <TableCell className="font-medium">
                                    {record.vintage} {record.productDescription}
                                    <p className="text-sm text-muted-foreground">{record.volumeLitres} L</p>
                                </TableCell>
                                <TableCell>{record.consignee}</TableCell>
                                <TableCell>{format(new Date(record.deliveryDate), 'PPP')}</TableCell>
                                <TableCell className="text-right">
                                    {record.consignorSignaturePath && (
                                         <Button asChild variant="outline" size="sm">
                                            <Link href={record.consignorSignaturePath} target="_blank" download>
                                                <FileDown className="mr-2 h-4 w-4" />
                                                View POD
                                            </Link>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
