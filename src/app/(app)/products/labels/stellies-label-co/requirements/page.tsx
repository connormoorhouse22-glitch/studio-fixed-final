
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode, Palette, Ruler, ScanLine, Loader2, Wand2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitLabelQuote, type LabelQuoteResponse } from '@/lib/label-actions';
import { SubmitButton } from '@/app/(app)/products/labels/submit-button';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { analyzeLabelArtwork } from '@/ai/flows/label-embellishment-analysis';

const initialState: LabelQuoteResponse = {
  success: false,
  message: '',
};

export default function StelliesLabelCoRequirementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const artworkFileRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useFormState(submitLabelQuote, initialState);
  
  const [frontQuantity, setFrontQuantity] = useState('1000');
  const [backQuantity, setBackQuantity] = useState('1000');
  const [areQuantitiesLinked, setAreQuantitiesLinked] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finishes, setFinishes] = useState('');

  useEffect(() => {
    if (state.message) {
        if (state.success) {
            toast({
                title: 'Submission Successful',
                description: state.message || 'Your quote request has been sent to Stellies Label Co.',
            });
             formRef.current?.reset();
             setFrontQuantity('1000');
             setBackQuantity('1000');
             setFinishes('');
             setAreQuantitiesLinked(true);
             router.push('/orders');
        } else {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: state.message,
            });
        }
    }
  }, [state, router, toast]);

  const handleFrontQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFrontQuantity(value);
    if (areQuantitiesLinked) {
      setBackQuantity(value);
    }
  };

  const handleBackQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBackQuantity(value);
    if (areQuantitiesLinked) {
      setFrontQuantity(value);
    }
  };
  
  const handleLinkChange = (linked: boolean) => {
    setAreQuantitiesLinked(linked);
    if (linked) {
      setBackQuantity(frontQuantity);
    }
  }

  const handleAnalyzeArtwork = async () => {
    if (!artworkFileRef.current?.files?.[0]) {
      toast({
        variant: 'destructive',
        title: 'No Artwork Selected',
        description: 'Please select an artwork file before analyzing.',
      });
      return;
    }

    const file = artworkFileRef.current.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const artworkDataUri = reader.result as string;
      setIsAnalyzing(true);
      try {
        const result = await analyzeLabelArtwork({ artworkDataUri });
        setFinishes(result.suggestedEmbellishments);
        toast({
          title: 'Analysis Complete',
          description: 'Suggested embellishments have been populated.',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze the artwork. Please enter details manually.',
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
  };

  const artworkSpecs = [
    {
      icon: <FileCode className="h-6 w-6 text-primary" />,
      title: 'Preferred File Formats',
      details: 'Please supply artwork as print-ready PDF, Adobe Illustrator (.ai), or EPS files.',
    },
    {
      icon: <Palette className="h-6 w-6 text-primary" />,
      title: 'Color Mode',
      details: 'All colors must be in CMYK mode. If spot colors (Pantone) are required, they must be clearly specified.',
    },
    {
      icon: <Ruler className="h-6 w-6 text-primary" />,
      title: 'Bleed & Safety Margins',
      details: 'A 3mm bleed is required on all edges. Keep all critical text and graphics 2mm inside the trim line.',
    },
    {
      icon: <ScanLine className="h-6 w-6 text-primary" />,
      title: 'Image Resolution',
      details: 'All embedded images and raster graphics must have a minimum resolution of 300 DPI.',
    },
  ];
  

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stellies Label Co Production</h2>
        <p className="text-muted-foreground">
          Submit your artwork and specifications for a new label order.
        </p>
      </div>

       <Card>
            <form ref={formRef} action={formAction}>
             <input type="hidden" name="supplier" value="Stellies Label Co" />
            <CardHeader>
                <CardTitle>Submit New Label Order</CardTitle>
                <CardDescription>
                Enter the required quantity and upload your print-ready artwork file.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="front_quantity">Number of Front Labels Required</Label>
                        <Input 
                            id="front_quantity" 
                            name="front_quantity" 
                            type="number" 
                            value={frontQuantity}
                            onChange={handleFrontQuantityChange}
                            required 
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="back_quantity">Number of Back Labels Required</Label>
                        <Input 
                            id="back_quantity" 
                            name="back_quantity" 
                            type="number" 
                            value={backQuantity}
                            onChange={handleBackQuantityChange}
                            disabled={areQuantitiesLinked}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="link-quantities" 
                            checked={areQuantitiesLinked}
                            onCheckedChange={(checked) => handleLinkChange(checked as boolean)}
                        />
                        <label
                            htmlFor="link-quantities"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                           Quantities are the same
                        </label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="artwork">Upload Artwork</Label>
                         <Input 
                            id="artwork" 
                            name="artwork"
                            type="file" 
                            accept=".pdf,.ai,.eps,.jpg,.png"
                            required
                            ref={artworkFileRef}
                        />
                        <p className="text-xs text-muted-foreground">
                            Max file size: 10MB. Formats: PDF, AI, EPS, JPG, PNG.
                        </p>
                    </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                        <Label htmlFor="finishes">Finishes &amp; Embellishments</Label>
                        <div className="flex items-start gap-2">
                           <Textarea
                                id="finishes"
                                name="finishes"
                                placeholder="e.g., High-build varnish, gold foiling, embossing on the brand name..."
                                className="min-h-[70px] flex-grow"
                                value={finishes}
                                onChange={(e) => setFinishes(e.target.value)}
                            />
                             <Button type="button" variant="outline" size="icon" onClick={handleAnalyzeArtwork} disabled={isAnalyzing} aria-label="Analyze Artwork">
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes for the Supplier (Optional)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Specify any other instructions, paper stock preferences, or questions here..."
                            className="min-h-[70px]"
                        />
                    </div>
                </div>
            </CardContent>
            <CardContent>
                <SubmitButton buttonText="Submit to Stellies Label Co" />
            </CardContent>
            </form>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artwork Specifications</CardTitle>
          <CardDescription>
            To ensure the highest quality print, please adhere to the following artwork requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {artworkSpecs.map((spec) => (
            <div key={spec.title} className="block rounded-lg border p-4">
              <div className="flex items-start gap-4 h-full">
                {spec.icon}
                <div>
                  <h3 className="font-semibold">{spec.title}</h3>
                  <p className="text-sm text-muted-foreground">{spec.details}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
