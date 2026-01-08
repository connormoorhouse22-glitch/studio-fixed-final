
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator, Info, FlaskConical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SO2AdditionCalculatorPage() {
  const [volume, setVolume] = useState<number | ''>(1000);
  const [currentSO2, setCurrentSO2] = useState<number | ''>(10);
  const [targetSO2, setTargetSO2] = useState<number | ''>(35);
  
  const [requiredGramsSO2, setRequiredGramsSO2] = useState<number>(0);
  const [requiredGramsKMBS, setRequiredGramsKMBS] = useState<number>(0);
  const [requiredMlSolution, setRequiredMlSolution] = useState<number>(0);

  useEffect(() => {
    const vol = Number(volume);
    const current = Number(currentSO2);
    const target = Number(targetSO2);

    if (vol > 0 && target > current) {
      const ppmToAdd = target - current;
      const gramsSO2 = (ppmToAdd * vol) / 1000;
      const gramsKMBS = gramsSO2 / 0.576; // KMBS is approx 57.6% SO₂
      const mlSolution = gramsKMBS * 10; // For a 10% solution (10g in 100ml)
      
      setRequiredGramsSO2(gramsSO2);
      setRequiredGramsKMBS(gramsKMBS);
      setRequiredMlSolution(mlSolution);
    } else {
      setRequiredGramsSO2(0);
      setRequiredGramsKMBS(0);
      setRequiredMlSolution(0);
    }
  }, [volume, currentSO2, targetSO2]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">SO₂ Addition Calculator</h2>
        <p className="text-muted-foreground">
          Calculate the required amount of Sulphur Dioxide for your wine.
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Calculation Inputs</CardTitle>
                    <CardDescription>Enter your wine volume and SO₂ levels to get the required additions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="volume">Wine Volume (Litres)</Label>
                            <Input
                                id="volume"
                                type="number"
                                value={volume}
                                onChange={(e) => setVolume(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g., 1000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current-so2">Current Free SO₂ (ppm)</Label>
                            <Input
                                id="current-so2"
                                type="number"
                                value={currentSO2}
                                onChange={(e) => setCurrentSO2(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g., 10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target-so2">Target Free SO₂ (ppm)</Label>
                            <Input
                                id="target-so2"
                                type="number"
                                value={targetSO2}
                                onChange={(e) => setTargetSO2(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g., 35"
                            />
                        </div>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Alert variant="destructive">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Disclaimer</AlertTitle>
                        <AlertDescription>
                        This calculator is provided as a guide only. All calculations should be checked and verified by a qualified winemaker or lab technician before any additions are made. WineSpace assumes no liability for any errors or inaccuracies.
                        </AlertDescription>
                    </Alert>
                </CardFooter>
            </Card>
        </div>

        <div className="lg:col-span-1">
             <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FlaskConical className="h-6 w-6 text-primary" />
                        Required Additions
                    </CardTitle>
                    <CardDescription>Results based on your inputs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Grams of Pure SO₂</p>
                        <p className="text-2xl font-bold">{requiredGramsSO2.toFixed(2)} g</p>
                    </div>
                    <div className="flex flex-col rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Grams of KMBS</p>
                        <p className="text-2xl font-bold">{requiredGramsKMBS.toFixed(2)} g</p>
                         <p className="text-xs text-muted-foreground mt-1">(Potassium Metabisulfite at 57.6% SO₂)</p>
                    </div>
                    <div className="flex flex-col rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">10% KMBS Solution</p>
                        <p className="text-2xl font-bold">{requiredMlSolution.toFixed(2)} ml</p>
                        <p className="text-xs text-muted-foreground mt-1">(10g KMBS dissolved in 100ml water)</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
