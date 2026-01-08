
'use server';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getVessels } from '@/lib/cellar-actions';
import { VesselsList } from './vessels-list';
import { AddVesselDialog } from './add-vessel-dialog';

async function handleVesselUpdate() {
    'use server';
    revalidatePath('/cellar-ops/vessels');
}

export default async function VesselsPage() {
    const producerEmail = cookies().get('userEmail')?.value;
    const vessels = producerEmail ? await getVessels(producerEmail) : [];

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Manage Vessels</h2>
                <p className="text-muted-foreground">
                    Define and manage your cellar's tanks and barrel groups.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Your Cellar Vessels</CardTitle>
                        <CardDescription>
                            A list of all tanks and barrel groups you have configured.
                        </CardDescription>
                    </div>
                    <AddVesselDialog onSuccess={handleVesselUpdate} />
                </CardHeader>
                <CardContent>
                    <VesselsList vessels={vessels} />
                </CardContent>
            </Card>
        </div>
    )
}
