
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, Wine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateBulkWineListing, type BulkWineListing } from '@/lib/bulk-wine-actions';

const listingSchema = z.object({
  cultivar: z.string().min(1, { message: 'Please select a cultivar.' }),
  vintage: z.coerce.number().min(2000, { message: 'Please enter a valid vintage year.' }).max(new Date().getFullYear() + 1),
  litres: z.coerce.number().min(100, { message: 'Minimum listing is 100 litres.' }),
  pricePerLitre: z.coerce.number().min(0.01, { message: 'Price must be a positive number.' }),
  region: z.string().min(1, { message: 'Please select a region.' }),
  ipw: z.string().min(1, { message: 'Please select an option for IPW.' }),
  wieta: z.string().min(1, { message: 'Please select an option for WIETA.' }),
});

const initialState = {
  success: false,
  message: '',
};

const wineRegions = [
    "Stellenbosch", "Paarl", "Constantia", "Swartland", "Elgin", "Franschhoek Valley",
    "Robertson", "Breedekloof", "Worcester", "Wellington", "Darling", "Walker Bay",
    "Cape Agulhas", "Overberg", "Durbanville", "Hemel-en-Aarde Valley",
    "Citrusdal Valley", "Olifants River", "Klein Karoo", "Cape Town", "Tulbagh",
    "Simonsberg-Stellenbosch", "Jonkershoek Valley", "Bottelary", "Polkadraai Hills",
    "Hemel-en-Aarde Ridge", "Upper Hemel-en-Aarde Valley", "Banghoek",
    "Cape South Coast", "Western Cape"
].sort();

const southAfricanCultivars = [
    "Cabernet Franc", "Cabernet Sauvignon", "Chardonnay", "Chenin Blanc", "Cinsaut",
    "Colombar", "Dry Red", "Dry White", "Gewürztraminer", "Grenache", "Malbec", "Merlot", "Mourvèdre",
    "Muscat d'Alexandrie", "Petit Verdot", "Pinot Noir", "Pinotage", "Riesling",
    "Rosé", "Roussanne", "Ruby Cabernet", "Sangiovese", "Sauvignon Blanc", "Sémillon",
    "Shiraz", "Sweet Red", "Sweet Rosé", "Sweet White", "Tempranillo", "Viognier"
].sort();


function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wine className="mr-2 h-4 w-4" />
            )}
            {isEditing ? 'Save Changes' : 'Submit Listing'}
        </Button>
    )
}

interface BulkWineListingFormProps {
    listing: BulkWineListing;
}

export function BulkWineListingForm({ listing }: BulkWineListingFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    
    const updateListingWithId = updateBulkWineListing.bind(null, listing.id);
    const [state, formAction] = useFormState(updateListingWithId, initialState);
    
    const form = useForm<z.infer<typeof listingSchema>>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            cultivar: listing.cultivar,
            vintage: Number(listing.vintage),
            litres: listing.litres,
            pricePerLitre: listing.pricePerLitre,
            region: listing.region,
            ipw: listing.ipw,
            wieta: listing.wieta,
        },
    });

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({
                    title: 'Listing Updated',
                    description: state.message,
                });
                router.push('/bulk-wine-market');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Update Failed',
                    description: state.message,
                });
            }
        }
    }, [state, toast, router]);

    return (
    <div className="flex flex-col gap-8">
        <div>
            <Button variant="outline" size="sm" asChild>
                <Link href="/bulk-wine-market">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Market
                </Link>
            </Button>
        </div>
      <Card className="max-w-2xl mx-auto w-full">
         <Form {...form}>
            <form action={formAction}>
                <CardHeader>
                    <CardTitle>Edit Bulk Wine Listing</CardTitle>
                    <CardDescription>Update the details for the listing from {listing.producer}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField
                            control={form.control}
                            name="cultivar"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cultivar</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a cultivar" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {southAfricanCultivars.map(cultivar => (
                                            <SelectItem key={cultivar} value={cultivar}>{cultivar}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="vintage"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vintage</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 2023" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="litres"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Litres Available</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="pricePerLitre"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price per Litre (ZAR)</FormLabel>
                                <FormControl>
                                <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select the wine's region of origin" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                     {wineRegions.map(region => (
                                        <SelectItem key={region} value={region}>{region}</SelectItem>
                                     ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="ipw"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>IPW Certified</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="wieta"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>WIETA Certified</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an option" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                   <SubmitButton isEditing={true} />
                </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}
