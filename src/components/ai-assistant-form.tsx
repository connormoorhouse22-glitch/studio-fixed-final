'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Sparkles } from 'lucide-react';

import { salesStrategySuggestions, type SalesStrategySuggestionsInput } from '@/ai/flows/sales-strategy-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  customerType: z.string().min(3, 'Customer type is required.'),
  product: z.string().min(3, 'Product name is required.'),
  context: z.string().min(20, 'Please provide more context (at least 20 characters).'),
  pastSuccessfulCases: z.string().min(20, 'Please describe past cases (at least 20 characters).'),
});

export function AiAssistantForm() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerType: '',
      product: '',
      context: '',
      pastSuccessfulCases: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await salesStrategySuggestions(values as SalesStrategySuggestionsInput);
      setSuggestion(result.strategySuggestions);
    } catch (error) {
      console.error('Error getting sales suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate sales strategy suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Provide Sales Context</CardTitle>
          <CardDescription>Fill in the details below to get tailored suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Enterprise, Small Business" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product/Service</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Synergy CRM Suite" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Sales Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the customer's needs, challenges, and your current sales stage."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pastSuccessfulCases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Past Successful Cases</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe similar successful sales cases. What worked well?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Suggestions
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>AI-Powered Suggestions</CardTitle>
          <CardDescription>Your generated sales strategies will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          {isLoading && <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />}
          {!isLoading && !suggestion && (
            <div className="text-center text-muted-foreground">
              <Bot className="mx-auto h-12 w-12" />
              <p className="mt-4">Your suggestions are waiting.</p>
            </div>
          )}
          {suggestion && (
            <div className="prose prose-sm max-w-none text-foreground">
              {suggestion.split('\n').map((line, index) => {
                if (line.startsWith('* ') || line.startsWith('- ')) {
                  return (
                    <p key={index} className="!my-2">
                      <span className="text-primary mr-2">◆</span>
                      {line.substring(2)}
                    </p>
                  );
                }
                return <p key={index}>{line}</p>;
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            AI suggestions are for informational purposes and may require human judgment.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
