
'use client';

import { useEffect, useState, useId } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, Send, Loader2, PlusCircle } from 'lucide-react';
import { submitQrCodeRequest, type QrCodeRequest } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" disabled={pending} className="bg-primary hover:bg-primary/90">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                </>
            ) : (
                <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit QR Code Request(s)
                </>
            )}
        </Button>
    )
}

const wineOfOrigins = [
  "Western Cape", "Stellenbosch", "Paarl", "Constantia", "Durbanville", "Swartland",
  "Darling", "Franschhoek Valley", "Wellington", "Breedekloof", "Robertson", 
  "Worcester", "Elgin", "Overberg", "Walker Bay", "Cape Agulhas", "Citrusdal Valley", 
  "Olifants River", "Klein Karoo", "Northern Cape", "Free State", "Kwazulu-Natal", 
  "Limpopo", "Eastern Cape", "Jonkershoek Valley", "Banghoek", "Polkadraai Hills",
  "Bottelary", "Simonsberg-Stellenbosch", "Cape South Coast", "Cape Coast", "Cape Town",
  "Hemel en Aarde", "Hemel en Aarde Ridge", "Hemel en Aarde Valley"
].sort();

const ingredientsList = [
    'Sulphur', 'Enzymes', 'Water', 'Tannins', 'Wood Chips', 'De-hydrated yeast hulls',
    'Inactive yeast cells', 'Ammonium Sulphate', 'Thiamine vitamins', 'Di-ammonium phosphate',
    'Tartaric acid', 'Citric acid', 'Dry Ice', 'Bentonite', 'Vegetable protein',
    'Manno proteins', 'Wood matured ( Oak barrels )', 'Sugar', 'Potassium Polyaspartate A-5DK/SD',
    'Carboxymethycellulose (CMC)'
].sort();


export function QrCodeRequestForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useFormState(submitQrCodeRequest, initialState);
    const [requests, setRequests] = useState<QrCodeRequest[]>([{ id: `qr_${useId()}` }]);
    const [showOtherInput, setShowOtherInput] = useState<{ [key: string]: boolean }>({});
    
    const currentYear = new Date().getFullYear();
    const vintageYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({
                    title: 'Request Submitted!',
                    description: state.message,
                });
                router.push('/producer/dashboard'); // Redirect on success to the producer dashboard
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Submission Failed',
                    description: state.message,
                });
            }
        }
    }, [state, toast, router]);
    
    const addRequestForm = () => {
        setRequests(prev => [...prev, { id: `qr_${Date.now()}` }]);
    };

    const handleRemoveRequest = (id: string) => {
        setRequests(prev => prev.filter(req => req.id !== id));
    };

    const handleOtherCheckboxChange = (checked: boolean, index: number) => {
        setShowOtherInput(prev => ({ ...prev, [index]: checked }));
    };

    return (
        <form action={formAction}>
            <input type="hidden" name="requests" value={JSON.stringify(requests)} />
            {requests.map((request, index) => (
                <Card key={request.id} className="mb-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>QR Code Request #{index + 1}</CardTitle>
                        {requests.length > 1 && (
                             <Button variant="ghost" size="icon" onClick={() => handleRemoveRequest(request.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor={`wineName-${index}`}>Name of Wine</Label>
                                <Input id={`wineName-${index}`} name={`wineName-${index}`} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`wineRange-${index}`}>Wine Range (Optional)</Label>
                                <Input id={`wineRange-${index}`} name={`wineRange-${index}`} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`vintage-${index}`}>Vintage</Label>
                                <Select name={`vintage-${index}`} required>
                                    <SelectTrigger id={`vintage-${index}`}>
                                        <SelectValue placeholder="Select vintage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vintageYears.map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor={`wineOfOrigin-${index}`}>Wine of Origin</Label>
                                <Select name={`wineOfOrigin-${index}`} required>
                                    <SelectTrigger id={`wineOfOrigin-${index}`}>
                                        <SelectValue placeholder="Select an origin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {wineOfOrigins.map(origin => <SelectItem key={origin} value={origin}>{origin}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`sealType-${index}`}>Seal Type</Label>
                                <Select name={`sealType-${index}`} required>
                                    <SelectTrigger id={`sealType-${index}`}>
                                        <SelectValue placeholder="Select a seal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Black & White Seal">Black & White Seal</SelectItem>
                                        <SelectItem value="IPW">IPW</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`wieta-${index}`}>WIETA</Label>
                                <Select name={`wieta-${index}`} required>
                                    <SelectTrigger id={`wieta-${index}`}>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`wwf-${index}`}>WWF Foundation</Label>
                                <Select name={`wwf-${index}`} required>
                                    <SelectTrigger id={`wwf-${index}`}>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`wsr2aForm-${index}`}>WSR2A Analysis Form</Label>
                                <Input id={`wsr2aForm-${index}`} name={`wsr2aForm-${index}`} type="file" required />
                                <p className="text-xs text-muted-foreground">Please upload the lab analysis for this specific wine.</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`bottleShot-${index}`}>Bottle Shot (Optional)</Label>
                                <Input id={`bottleShot-${index}`} name={`bottleShot-${index}`} type="file" accept="image/*" />
                                <p className="text-xs text-muted-foreground">Upload a picture of the wine bottle.</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                             <Label>Ingredients Checklist</Label>
                             <div className="p-6 border-dashed border-2 rounded-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {ingredientsList.map(ingredient => {
                                    const slug = ingredient.toLowerCase().replace(/ /g, '-');
                                    const id = `ingredients-${index}-${slug}`;
                                    const name = `ingredients-${index}-${slug}`;
                                    return (
                                        <div key={id} className="flex items-center space-x-2">
                                            <Checkbox id={id} name={name} />
                                            <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {ingredient}
                                            </label>
                                        </div>
                                    )
                                })}
                                <div className="flex items-center space-x-2 col-span-full md:col-span-1">
                                    <Checkbox id={`ingredients-${index}-other`} name={`ingredients-${index}-other`} onCheckedChange={(checked) => handleOtherCheckboxChange(checked as boolean, index)} />
                                    <label htmlFor={`ingredients-${index}-other`} className="text-sm font-medium leading-none">
                                        Other
                                    </label>
                                    <Input
                                        type="text"
                                        name={`otherIngredient-${index}`}
                                        className={cn("h-8 transition-opacity", showOtherInput[index] ? 'opacity-100' : 'opacity-0 pointer-events-none')}
                                        placeholder="Specify other ingredient"
                                    />
                                </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex flex-col items-center gap-4">
                <Button variant="outline" type="button" onClick={addRequestForm}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another QR Code Request
                </Button>
                <SubmitButton />
            </div>
        </form>
    );
}
