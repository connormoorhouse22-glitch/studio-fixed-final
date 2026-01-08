
'use server';

import { Suspense } from 'react';
import { Skeleton, Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui';
import { MachinesList } from './machines-list';

function MachinesPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

export default async function MachinesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Machine Inventory</h2>
        <p className="text-muted-foreground">
          Manage your equipment, specifications, and operational status.
        </p>
      </div>
       <Suspense fallback={<MachinesPageSkeleton />}>
            <MachinesList />
       </Suspense>
    </div>
  );
}
