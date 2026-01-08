
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, PackagePlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addProduct } from '@/lib/product-actions';
import { Separator } from '@/components/ui/separator';

const productSchema = z.object({
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  priceTier2: z.coerce.number().optional(),
  priceTier3: z.coerce.number().optional(),
  priceTier4: z.coerce.number().optional(),
  priceTier5: z.coerce.number().optional(),
  priceTier6: z.coerce.number().optional(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  image: z.string().url({ message: 'Please enter a valid image URL.' }),
  aiHint: z.string().min(2, { message: 'AI hint must be at least 2 characters.'}),
  stockOnHand: z.coerce.number().optional(),
  unitsPerPallet: z.coerce.number().optional(),
  labelSize: z.string().optional(),
  labelText: z.string().optional(),
});

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const company = localStorage.getItem('userCompany');
    setCompanyName(company);
  }, []);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      priceTier2: undefined,
      priceTier3: undefined,
      priceTier4: undefined,
      priceTier5: undefined,
      priceTier6: undefined,
      description: '',
      image: 'https://picsum.photos/600/400',
      aiHint: 'product image',
      stockOnHand: 0,
      unitsPerPallet: 0,
      labelSize: '',
      labelText: '',
    },
  });

  const selectedCategory = form.watch('category');

  async function onSubmit(values: z.infer<typeof productSchema>) {
    if (!companyName) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not determine supplier company. Please log in again.',
        });
        return;
    }
    
    setIsLoading(true);
    try {
        await addProduct({
            ...values,
            supplier: companyName,
        });

        toast({
            title: 'Product Added',
            description: `Successfully added "${values.name}" to your catalog.`,
        });
        router.push('/products/manage');
    } catch (error) {
        console.error('Failed to add product:', error);
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: 'Failed to add the product. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  const isLabelCategory = selectedCategory === 'Carton & Importer labels';

  return (
    <div className="flex flex-col gap-8">
        <div>
            <Button variant="outline" size="sm" asChild>
                <Link href="/products/manage">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
            </Button>
        </div>
        <Card className="max-w-4xl mx-auto w-full">
            <CardHeader>
            <CardTitle>Add a New Product</CardTitle>
            <CardDescription>Fill in the details below to add a new item to your product catalog.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., 750ml Flint Claret/Bordeaux Bottle" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Describe the product, its features, and materials."
                            className="min-h-[100px]"
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
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Bottles">Bottles</SelectItem>
                                    <SelectItem value="Screwcaps">Screwcaps</SelectItem>
                                    <SelectItem value="Corks">Corks</SelectItem>
                                    <SelectItem value="Labels">Labels</SelectItem>
                                    <SelectItem value="Cartons">Cartons</SelectItem>
                                    <SelectItem value="Carton & Importer labels">Carton & Importer labels</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                {isLabelCategory && (
                    <>
                        <Separator />
                        <h3 className="text-lg font-medium">Label Specifications</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="labelSize"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label Size</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., 31x13mm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="labelText"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label Text/Title</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., UK - SWIG" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </>
                )}


                <Separator />
                <h3 className="text-lg font-medium">Pricing Tiers</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (Tier 1)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="priceTier2"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (Tier 2)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="priceTier3"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (Tier 3)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priceTier4"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (Tier 4)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priceTier5"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (Tier 5)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priceTier6"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (Tier 6)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <Separator />

                {selectedCategory === 'Bottles' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="stockOnHand"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock on Hand</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unitsPerPallet"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Units per Pallet</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                )}
                 <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="aiHint"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>AI Hint</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. wine bottle" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Product...
                    </>
                    ) : (
                    <>
                        <PackagePlus className="mr-2 h-4 w-4" />
                        Add Product
                    </>
                    )}
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
    </div>
  );
}

    