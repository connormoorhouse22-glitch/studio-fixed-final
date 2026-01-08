
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { addQuoteToRfq, type Quote } from '@/lib/quote-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';


const quoteSchema = z.object({
  price: z.coerce.number().min(0.01, { message: "Price must be a positive number." }),
  notes: z.string().optional(),
});

const initialState = {
  success: false,
  message: '',
};

function SubmitButton({ isUpdate }: { isUpdate: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
                isUpdate ? 'Update Quote' : 'Submit Quote'
            )}
        </Button>
    )
}

interface SubmitQuoteFormProps {
    rfqId: string;
    existingQuote?: Quote | null;
}

export function SubmitQuoteForm({ rfqId, existingQuote }: SubmitQuoteFormProps) {
    const { toast } = useToast();
    const [state, formAction] = useFormState(addQuoteToRfq.bind(null, rfqId), initialState);

    const form = useForm<z.infer<typeof quoteSchema>>({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            price: existingQuote?.price || undefined,
            notes: existingQuote?.notes || '',
        }
    });

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({
                    title: 'Success!',
                    description: state.message,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: state.message,
                });
            }
        }
    }, [state, toast]);

    if (existingQuote) {
        return (
             <Alert variant="default" className="border-green-500 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 !text-green-600" />
                <AlertTitle className="text-green-900">Quote Submitted</AlertTitle>
                <AlertDescription>
                    You have already submitted a quote for this request. Producers will contact you if they wish to proceed.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Form {...form}>
            <form action={formAction} className="space-y-6">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Price per Unit (ZAR)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g. 2.50" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add any notes about lead times, minimum quantities, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <SubmitButton isUpdate={!!existingQuote} />
            </form>
        </Form>
    )
}
