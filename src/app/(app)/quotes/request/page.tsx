
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, FileText, Loader2, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createRfq, type CreateRfqResponse } from '@/lib/quote-actions';


const rfqSchema = z.object({
  title: z.string().min(10, { message: 'Please provide a descriptive title (min. 10 characters).' }),
  category: z.enum(['Bottles', 'Screwcaps', 'Corks', 'Labels', 'Cartons', 'Other']),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1.' }),
  deliveryDate: z.date().optional(),
  description: z.string().min(50, { message: 'Please provide a detailed description (min. 50 characters).' }),
  attachment: z.any().optional(),
});

const initialState: CreateRfqResponse = {
  success: false,
  message: '',
};

export default function RequestQuotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [fileName, setFileName] = useState('');
  const [state, formAction] = useFormState(createRfq, initialState);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof rfqSchema>>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      title: '',
      quantity: 1,
      description: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'RFQ Submitted Successfully!',
          description: state.message || 'Your request for a quote has been sent to relevant suppliers.',
        });
        router.push('/quotes');
      } else {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: state.message,
        });
      }
      setIsLoading(false);
    }
  }, [state, toast, router]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      form.setValue('attachment', file);
    } else {
        setFileName('');
        form.setValue('attachment', null);
    }
  };

  const onFormSubmit = (data: z.infer<typeof rfqSchema>) => {
    setIsLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        if (key === 'deliveryDate' && value instanceof Date) {
            formData.append(key, value.toISOString());
        } else {
            formData.append(key, value);
        }
      }
    });
    formAction(formData);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Request a Quote</h2>
        <p className="text-muted-foreground">
          Fill out the form below to get quotes from our network of suppliers.
        </p>
      </div>

      <Card className="w-full max-w-3xl mx-auto">
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
                <CardHeader>
                    <CardTitle>Quote Details</CardTitle>
                    <CardDescription>The more detail you provide, the more accurate the quotes will be.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>RFQ Title</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Custom Printed Labels for 2024 Merlot" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a product category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Bottles">Bottles</SelectItem>
                                        <SelectItem value="Screwcaps">Screwcaps</SelectItem>
                                        <SelectItem value="Corks">Corks</SelectItem>
                                        <SelectItem value="Labels">Labels</SelectItem>
                                        <SelectItem value="Cartons">Cartons</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Detailed Description</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Please describe your requirements in detail. Include specifications like material, dimensions, color, etc."
                                className="min-h-[150px]"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField
                            control={form.control}
                            name="deliveryDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Desired Delivery Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="attachment"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Attach File (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                            <Button asChild variant="outline" className="w-full">
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <UploadCloud className="mr-2 h-4 w-4" />
                                                    {fileName || "Upload specification, design, etc."}
                                                </label>
                                            </Button>
                                        </div>
                                    </FormControl>
                                     <FormDescription className="text-xs">
                                        Max file size: 5MB. Accepted formats: PDF, JPG, PNG.
                                    </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting RFQ...
                        </>
                        ) : (
                        <>
                            <FileText className="mr-2 h-4 w-4" />
                            Submit Request for Quote
                        </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}
