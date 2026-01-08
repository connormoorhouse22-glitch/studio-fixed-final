
'use server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOffenders } from '@/lib/offender-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function RedFlagZonePage() {
    const offenders = await getOffenders();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Red Flag Zone</h2>
                <p className="text-muted-foreground">
                   A shared list of entities flagged by the community for business conduct issues.
                </p>
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
                    <CardDescription>This is a read-only list for producer awareness. To report an issue, please contact a WineSpace administrator.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Telephone</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Flagged By</TableHead>
                                <TableHead className="text-right">Date Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offenders.length > 0 ? offenders.slice().reverse().map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.company}</TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{item.telephone}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.reason}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{item.reportedBy}</TableCell>
                                    <TableCell className="text-right">{format(new Date(item.dateAdded), 'PPP')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4">The Red Flag Zone is currently empty.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
