
'use server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuditLogs, type AuditLogEvent } from '@/lib/audit-log-actions';
import { AuditLogList } from './audit-log-list';

export default async function AuditLogPage() {
    const logs = await getAuditLogs();

    return (
        <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Audit Log</h2>
                <p className="text-muted-foreground">
                    A chronological record of all significant events that have occurred on the platform.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Platform Events</CardTitle>
                    <CardDescription>
                        Search and filter through all recorded user and system actions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AuditLogList initialLogs={logs} />
                </CardContent>
            </Card>
        </div>
    )
}
