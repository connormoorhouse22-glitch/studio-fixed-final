
'use server';

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getRfqById } from '@/lib/quote-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { FileDown, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubmitQuoteForm } from './submit-quote-form';

export default async function RespondToRfqPage({ params }: { params: { id: string } }) {
    const rfq = await getRfqById(params.id);
    const cookieStore = cookies();
    const supplierCompany = cookieStore.get('userCompany')?.value;
    
    if (!rfq || !supplierCompany) {
        notFound();
    }
    
    const existingQuote = rfq.quotes.find(q => q.supplierCompany === supplierCompany);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{rfq.title}</h2>
                <p className="text-muted-foreground">A quote request from {rfq.producerCompany}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
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
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>{existingQuote ? 'Your Submitted Quote' : 'Submit Your Quote'}</CardTitle>
                            <CardDescription>
                                {existingQuote ? `Submitted on ${format(new Date(existingQuote.createdAt), 'PPP')}` : 'Enter your price per unit and any additional notes.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <SubmitQuoteForm rfqId={rfq.id} existingQuote={existingQuote} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
