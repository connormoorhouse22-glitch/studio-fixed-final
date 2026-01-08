
'use server';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { revalidatePath } from 'next/cache';

export default async function ActivityLogPage() {

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
                <p className="text-muted-foreground">
                    A chronological record of all cellar operations.
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Log History</CardTitle>
                        <CardDescription>
                            Your logged cellar additions are listed below.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-10">This feature is coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
