
'use server';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AddRecordDialog } from './add-record-dialog';
import { revalidatePath } from 'next/cache';
import { DeliveryRecordsList } from './delivery-records-list';
import { cookies } from 'next/headers';
import { getDeliveryRecords } from '@/lib/delivery-record-actions';

async function handleRecordUpdate() {
    'use server';
    revalidatePath('/sawis/delivery-records');
}

export default async function DeliveryRecordsPage() {
    const userEmail = cookies().get('userEmail')?.value;
    const records = userEmail ? await getDeliveryRecords(userEmail) : [];
    
    return (
        <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Delivery Records</h2>
                <p className="text-muted-foreground">
                    A log of all your wine deliveries to clients.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Delivery History</CardTitle>
                        <CardDescription>
                            Your submitted delivery records are listed below.
                        </CardDescription>
                    </div>
                    <AddRecordDialog onSuccess={handleRecordUpdate} />
                </CardHeader>
                <CardContent>
                    <DeliveryRecordsList initialRecords={records} />
                </CardContent>
            </Card>
        </div>
    )
}
