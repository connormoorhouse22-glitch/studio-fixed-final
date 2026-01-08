
'use server';

/**
 * @fileOverview This file defines a function for providing sales strategy suggestions
 * based on successful prior cases and similar contexts using Genkit.
 *
 * - salesStrategySuggestions - a function that generates sales strategy suggestions.
 * - SalesStrategySuggestionsInput - The input type for the salesStrategySuggestions function.
 * - SalesStrategySuggestionsOutput - The return type for the salesStrategySuggestions function.
 */

import { SalesStrategySuggestionsInputSchema, SalesStrategySuggestionsOutputSchema } from './schemas';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export type SalesStrategySuggestionsInput = z.infer<typeof SalesStrategySuggestionsInputSchema>;
export type SalesStrategySuggestionsOutput = z.infer<typeof SalesStrategySuggestionsOutputSchema>;

const salesStrategyFlow = ai.defineFlow(
  {
    name: 'salesStrategyFlow',
    inputSchema: SalesStrategySuggestionsInputSchema,
    outputSchema: SalesStrategySuggestionsOutputSchema,
  },
  async (input) => {
    const prompt = `You are an AI-powered sales strategy assistant. Analyze the given sales context and past successful cases to provide actionable sales strategy suggestions. Respond with a JSON object that matches this Zod schema: ${JSON.stringify(SalesStrategySuggestionsOutputSchema.shape)}.

Customer Type: ${input.customerType}
Product: ${input.product}
Context: ${input.context}
Past Successful Cases: ${input.pastSuccessfulCases}

Based on this information, provide detailed and practical sales strategy suggestions that the sales representative can use to improve their performance.`;
    
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: prompt,
      output: {
        format: 'json',
        schema: SalesStrategySuggestionsOutputSchema,
      },
    });

    return output || { strategySuggestions: "Failed to generate suggestions. Please check the input and try again." };
  }
);

export async function salesStrategySuggestions(input: SalesStrategySuggestionsInput): Promise<SalesStrategySuggestionsOutput> {
  return salesStrategyFlow(input);
}
