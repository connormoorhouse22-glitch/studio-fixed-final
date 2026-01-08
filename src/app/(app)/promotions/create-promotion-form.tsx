
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/product-actions';
import type { PromotionResponse } from '@/lib/promotion-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createPromotion } from './actions';


const promotionSchema = z.object({
  productId: z.string().min(1, { message: "Please select a product." }),
  discountPercentage: z.coerce.number().min(1, { message: "Discount must be at least 1%." }).max(90, { message: "Discount cannot exceed 90%." }),
});

const initialState: PromotionResponse = {
  success: false,
  message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
                'Create Promotion'
            )}
        </Button>
    )
}

interface CreatePromotionFormProps {
    products: Product[];
    supplierCompany: string;
    onPromotionCreated: () => void;
}

export function CreatePromotionForm({ products, supplierCompany, onPromotionCreated }: CreatePromotionFormProps) {
    const { toast } = useToast();
    
    // Bind the supplierCompany to the server action
    const createPromotionWithSupplier = createPromotion.bind(null, supplierCompany);
    const [state, dispatch] = useFormState(createPromotionWithSupplier, initialState);
    
    const [selectedProductName, setSelectedProductName] = useState('');

    const form = useForm<z.infer<typeof promotionSchema>>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            productId: '',
            discountPercentage: 0,
        }
    });

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({
                    title: 'Success!',
                    description: state.message,
                });
                form.reset();
                setSelectedProductName('');
                onPromotionCreated(); // Re-fetch data on parent component
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: state.message,
                });
            }
        }
    }, [state, toast, form, onPromotionCreated]);

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p.id === productId);
        setSelectedProductName(product?.name || '');
        form.setValue('productId', productId);
    }
    
    return (
        <Form {...form}>
            <form action={dispatch} className="space-y-6">
                <input type="hidden" name="productName" value={selectedProductName} />
                <input type="hidden" name="productId" value={form.getValues('productId')} />
                <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select onValueChange={handleProductChange} value={field.value || ''}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a product to discount" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Discount Percentage</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g. 15" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <SubmitButton />
            </form>
        </Form>
    )
}
