
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFiltrationOptions, updateFiltrationOptions } from '@/lib/user-actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function FiltrationSettingsPage() {
  const { toast } = useToast();
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [providerCompany, setProviderCompany] = useState<string | null>(null);

  const fetchOptionsData = useCallback(async (company: string) => {
    setIsLoading(true);
    const fetchedOptions = await getFiltrationOptions(company);
    setOptions(fetchedOptions);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const company = localStorage.getItem('userCompany');
    if (company) {
      setProviderCompany(company);
      fetchOptionsData(company);
    } else {
      setIsLoading(false);
    }
  }, [fetchOptionsData]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!providerCompany) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No provider company identified. Please refresh and try again.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateFiltrationOptions(providerCompany, options.filter(opt => opt.trim() !== ''));

      if (result.success) {
        toast({
          title: 'Settings Saved',
          description: 'Your filtration options have been updated.',
        });
        await fetchOptionsData(providerCompany);
      } else {
         throw new Error(result.message || 'Failed to update settings.');
      }
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
        setIsSaving(false);
    }
  };
  
    if (isLoading) {
        return (
             <div className="flex flex-col gap-8">
                <div>
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-5 w-80 mt-2" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Filtration Setup</h2>
        <p className="text-muted-foreground">
          Manage the filtration options you offer to producers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Filtration Services</CardTitle>
          <CardDescription>
            Add or remove the types of filtration services you provide. These will be shown to producers when they book.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder="e.g., AF 30, AF 70"
              />
              <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addOption}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Option
          </Button>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
