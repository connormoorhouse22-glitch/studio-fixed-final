
'use server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOffenders } from '@/lib/offender-actions';
import { OffenderListAdmin } from './offender-list-admin';
import { revalidatePath } from 'next/cache';
import { AddOffenderDialog } from './add-offender-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

async function handleUpdate() {
    'use server';
    revalidatePath('/admin/red-flag-zone');
}

export default async function AdminRedFlagZonePage() {
    const offenders = await getOffenders();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Red Flag Zone Management</h2>
                    <p className="text-muted-foreground">
                       An internal list of entities flagged for business conduct issues. Visible only to admins.
                    </p>
                </div>
                 <AddOffenderDialog onSuccess={handleUpdate} />
            </div>
            
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                The information on this list is based on reports from users and has not been independently verified by WineSpace. This list is provided for informational purposes only. WineSpace is not liable for any business decisions or losses resulting from the use of this information. Always conduct your own due diligence.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Flagged Entities</CardTitle>
                    <CardDescription>A list of all individuals and companies in the Red Flag Zone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OffenderListAdmin offenders={offenders} onUpdate={handleUpdate} />
                </CardContent>
            </Card>
        </div>
    );
}
