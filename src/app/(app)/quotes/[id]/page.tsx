
'use server';

import { notFound } from 'next/navigation';
import { getRfqById } from '@/lib/quote-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function RfqDetailsPage({ params }: { params: { id: string } }) {
    const rfq = await getRfqById(params.id);

    if (!rfq) {
        notFound();
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{rfq.title}</h2>
                <p className="text-muted-foreground">Details for RFQ #{rfq.id}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <p className="font-semibold text-muted-foreground">Category</p>
                            <p>{rfq.category}</p>
                        </div>
                         <div>
                            <p className="font-semibold text-muted-foreground">Quantity</p>
                            <p className="flex items-center gap-2"><Hash className="h-4 w-4" /> {rfq.quantity.toLocaleString()}</p>
                        </div>
                         {rfq.deliveryDate && (
                            <div>
                                <p className="font-semibold text-muted-foreground">Desired Delivery Date</p>
                                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {format(new Date(rfq.deliveryDate), 'PPP')}</p>
                            </div>
                         )}
                     </div>
                     <Separator className="my-4" />
                     <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">{rfq.description}</p>
                     </div>
                     {rfq.attachment && (
                        <>
                            <Separator className="my-4" />
                             <div>
                                <h4 className="font-semibold mb-2">Attachment</h4>
                                <Button asChild variant="outline">
                                    <Link href={rfq.attachment} target="_blank">
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Download Attachment
                                    </Link>
                                </Button>
                             </div>
                        </>
                     )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Received Quotes</CardTitle>
                    <CardDescription>Quotes submitted by suppliers in response to your request.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Date Submitted</TableHead>
                                <TableHead className="text-right">Price per Unit</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rfq.quotes.length > 0 ? rfq.quotes.map(quote => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-medium">{quote.supplierCompany}</TableCell>
                                    <TableCell>{format(new Date(quote.createdAt), 'PPP')}</TableCell>
                                    <TableCell className="text-right font-mono">ZAR {quote.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-muted-foreground">{quote.notes}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm">Accept Quote</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No quotes have been received for this request yet.
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
