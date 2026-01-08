
'use server';

import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRfqsForProducer } from '@/lib/quote-actions';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';


export default async function MyQuoteRequestsPage() {
    const cookieStore = cookies();
    const producerEmail = cookieStore.get('userEmail')?.value;

    if (!producerEmail) {
        return <p>Could not find your user information. Please log in again.</p>
    }

    const rfqs = await getRfqsForProducer(producerEmail);

    const getStatusVariant = (status: string) => {
        switch(status) {
            case 'Pending': return 'secondary';
            case 'Responded': return 'default';
            case 'Accepted': return 'default';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Quote Requests</h2>
                <p className="text-muted-foreground">Track the status of all your submitted RFQs.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submitted RFQs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Quotes Received</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rfqs.length > 0 ? rfqs.slice().reverse().map(rfq => (
                                <TableRow key={rfq.id}>
                                    <TableCell className="font-medium">{rfq.title}</TableCell>
                                    <TableCell>{rfq.category}</TableCell>
                                    <TableCell>{format(new Date(rfq.createdAt), 'PPP')}</TableCell>
                                    <TableCell><Badge variant={getStatusVariant(rfq.status)}>{rfq.status}</Badge></TableCell>
                                    <TableCell className="text-center">{rfq.quotes.length}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/quotes/${rfq.id}`}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                View Details
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        You have not submitted any quote requests yet.
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
