
'use server';

/**
 * @fileOverview This file defines a function for analyzing label artwork
 * for potential printing embellishments using Genkit.
 *
 * - analyzeLabelArtwork - A function that takes an image of a label and suggests embellishments.
 * - LabelAnalysisInput - The input type for the analysis function.
 * - LabelAnalysisOutput - The return type for the analysis function.
 */

import { LabelAnalysisInputSchema, LabelAnalysisOutputSchema } from '@/ai/schemas/label-analysis-schemas';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export type LabelAnalysisInput = z.infer<typeof LabelAnalysisInputSchema>;
export type LabelAnalysisOutput = z.infer<typeof LabelAnalysisOutputSchema>;

const analyzeLabelArtworkFlow = ai.defineFlow(
  {
    name: 'analyzeLabelArtworkFlow',
    inputSchema: LabelAnalysisInputSchema,
    outputSchema: LabelAnalysisOutputSchema,
  },
  async (input) => {
    const promptText = `You are an expert in wine label printing and finishing. Analyze the provided artwork and identify any potential special printing embellishments that might be required or intended. Respond with a JSON object matching this Zod schema: ${JSON.stringify(LabelAnalysisOutputSchema.shape)}.

Look for things like:
- Metallic areas that would require foil stamping (e.g., gold foil, silver foil).
- Raised or indented areas that suggest embossing or debossing.
- Glossy sections on a matte background that would require spot UV or high-build varnish.
- Complex or non-rectangular shapes that would require a special die-cut.
- Any other premium features visible in the design.

Based on your analysis, provide a concise summary of the suggested embellishments. If no special embellishments are apparent, state that.`;

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: [
        { text: promptText },
        { media: { url: input.artworkDataUri } }
      ],
      output: {
        format: 'json',
        schema: LabelAnalysisOutputSchema,
      },
    });

    return output || { suggestedEmbellishments: 'Analysis failed. Please check the image and try again.' };
  }
);

export async function analyzeLabelArtwork(input: LabelAnalysisInput): Promise<LabelAnalysisOutput> {
  return analyzeLabelArtworkFlow(input);
}
