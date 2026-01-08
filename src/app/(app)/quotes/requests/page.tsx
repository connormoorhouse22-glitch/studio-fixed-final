
'use server';

import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRfqsForSuppliers } from '@/lib/quote-actions';
import { format } from 'date-fns';
import { Edit } from 'lucide-react';

export default async function QuoteRequestsPage() {
    const cookieStore = cookies();
    // Use the plain text company name from the cookie
    const supplierCompany = cookieStore.get('userCompany')?.value ? decodeURIComponent(cookieStore.get('userCompany')!.value) : undefined;

    if (!supplierCompany) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not identify your user information. Please log in again.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const rfqs = await getRfqsForSuppliers();

    const getStatusVariant = (status: string) => {
        switch(status) {
            case 'Pending': return 'secondary';
            case 'Responded': return 'default';
            default: return 'outline';
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Incoming Quote Requests</h2>
                <p className="text-muted-foreground">Review and respond to quote requests from producers.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Open RFQs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producer</TableHead>
                                <TableHead>Request Title</TableHead>
                                <TableHead>Date Received</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rfqs.length > 0 ? rfqs.slice().reverse().map(rfq => {
                                const hasResponded = rfq.quotes.some(q => q.supplierCompany === supplierCompany);
                                const status = hasResponded ? 'Responded' : rfq.status;

                                return (
                                <TableRow key={rfq.id}>
                                    <TableCell className="font-medium">{rfq.producerCompany}</TableCell>
                                    <TableCell>{rfq.title}</TableCell>
                                    <TableCell>{format(new Date(rfq.createdAt), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(status)}>
                                            {status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/quotes/requests/${rfq.id}`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                {hasResponded ? 'View / Edit Quote' : 'Submit Quote'}
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        There are no active quote requests at this time.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
