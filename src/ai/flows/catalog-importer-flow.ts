
'use server';
/**
 * @fileOverview This file defines a function for extracting structured product
 * data from the HTML of a supplier's webpage using Genkit.
 *
 * - scrapeCatalog - A function that takes HTML content and extracts product info.
 * - ScrapeCatalogInput - The input type for the scrapeCatalog function.
 * - ScrapeCatalogOutput - The return type for the scrapeCatalog function.
 */

import { ScrapedProductSchema, ScrapeCatalogInputSchema, ScrapeCatalogOutputSchema } from './schemas';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as cheerio from 'cheerio';

export type ScrapedProduct = z.infer<typeof ScrapedProductSchema>;
export type ScrapeCatalogInput = z.infer<typeof ScrapeCatalogInputSchema>;
export type ScrapeCatalogOutput = z.infer<typeof ScrapeCatalogOutputSchema>;

const extractMainContent = (html: string): string => {
  const $ = cheerio.load(html);
  $('header, footer, nav, script, style, noscript, aside').remove();
  let mainContent = $('main').html();
  if (!mainContent) {
    mainContent = $('body').html();
  }
  return mainContent || '';
};

const scrapeCatalogFlow = ai.defineFlow(
  {
    name: 'scrapeCatalogFlow',
    inputSchema: ScrapeCatalogInputSchema,
    outputSchema: ScrapeCatalogOutputSchema,
  },
  async (input) => {
    const mainContent = extractMainContent(input.htmlContent);
    const subCategoryInstruction = input.subCategory
      ? `IMPORTANT: The products on this page belong to the '${input.subCategory}' sub-category. You MUST use this exact value as the 'category' for every product you find.`
      : '';

    const prompt = `You are an expert at extracting structured data from webpage HTML. Analyze the provided HTML content and extract the details for all the products listed. Respond with a JSON object that matches this Zod schema: ${JSON.stringify(ScrapeCatalogOutputSchema.shape)}.

Focus on identifying distinct product items and extracting the following for each:
- Product name
- Price (as a number, clean up any currency symbols or text)
- Description
- Image URL
- Category / Sub-category. ${subCategoryInstruction}
- Supplier (if available)

If a field is not available, you can omit it. Ensure the image URL is a full, absolute URL.

Here is the HTML content:
${mainContent}
`;

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: prompt,
      output: {
        format: 'json',
        schema: ScrapeCatalogOutputSchema,
      },
    });

    return output || { products: [] };
  }
);


export async function scrapeCatalog(input: ScrapeCatalogInput): Promise<ScrapeCatalogOutput> {
  return scrapeCatalogFlow(input);
}
