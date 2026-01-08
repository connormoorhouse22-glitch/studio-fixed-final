
import { z } from 'zod';

export const LabelAnalysisInputSchema = z.object({
  artworkDataUri: z
    .string()
    .describe(
      "A data URI of the label artwork image. Must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type LabelAnalysisInput = z.infer<typeof LabelAnalysisInputSchema>;

export const LabelAnalysisOutputSchema = z.object({
  suggestedEmbellishments: z
    .string()
    .describe(
      'A summary of suggested printing embellishments based on the artwork.'
    ),
});
export type LabelAnalysisOutput = z.infer<typeof LabelAnalysisOutputSchema>;
