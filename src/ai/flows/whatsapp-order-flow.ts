
'use server';

/**
 * @fileOverview This file defines a function for parsing WhatsApp messages
 * from producers to create structured product orders using Genkit.
 *
 * - processWhatsappOrder - A function that takes a message and extracts order info.
 * - WhatsappOrderInput - The input type for the processWhatsappOrder function.
 * - WhatsappOrderOutput - The return type for the processWhatsappOrder function.
 */

import { OrderItemSchema, WhatsappOrderInputSchema, WhatsappOrderOutputSchema } from './schemas';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getProducts } from '@/lib/product-actions';

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type WhatsappOrderInput = z.infer<typeof WhatsappOrderInputSchema>;
export type WhatsappOrderOutput = z.infer<typeof WhatsappOrderOutputSchema>;

const processWhatsappOrderFlow = ai.defineFlow(
  {
    name: 'processWhatsappOrderFlow',
    inputSchema: WhatsappOrderInputSchema,
    outputSchema: WhatsappOrderOutputSchema,
  },
  async (input) => {
    const prompt = `You are an expert AI assistant for a wine supply procurement system called WineSpace. Your task is to parse a text message from a Wine Producer and convert it into a structured order. Respond with a JSON object that matches this Zod schema: ${JSON.stringify(WhatsappOrderOutputSchema.shape)}.

You will be given the user's message and a complete JSON list of all available products.

Follow these rules very carefully:
1.  **Identify Products**: Read the user's message and identify which products they want to order. Match their request to the products in the 'availableProducts' list. The user might use abbreviations or partial names; find the best match.
2.  **Determine Quantity**:
    *   For products in the 'Bottles' category, the user will specify quantity in "pallets". You MUST calculate the total number of units by multiplying the number of pallets by the 'unitsPerPallet' value from the product data.
    *   For products in the 'Screwcaps' category, the user will specify quantity in "boxes". You MUST calculate the total quantity by multiplying the number of boxes by 1000.
    *   For all other products, the user will specify a simple quantity (e.g., "5000 labels"). Use that number directly.
3.  **Construct the Order**: Create a list of order items. For each item, you MUST include all fields from the product catalog entry: id, name, price, supplier, category, unitsPerPallet (if present), image, and aiHint. The 'quantity' field must be the final calculated total number of units.
4.  **Handle Ambiguity**: If the user's request is unclear, if you cannot find a product, or if they do not specify a quantity, DO NOT add the item to the order. Instead, formulate a friendly 'reply' message asking for clarification. For example: "I found a '750ml Flint Claret/Bordeaux Bottle', is that correct? And how many pallets would you like?"
5.  **Generate a Reply**:
    *   If the order is clear and you have successfully identified all items and quantities, create a confirmation 'reply'. Summarize the order clearly. Example: "Thanks! I've created an order for: - 2 pallets (1,800 units) of 750ml Flint Claret/Bordeaux Bottle - 5 boxes (5,000 units) of Black Stelvin Screwcaps. I will send this to the suppliers now."
    *   If the order is empty because the message was not an order request (e.g., "hello"), reply with a helpful message like "Hello! I'm the WineSpace ordering assistant. You can place an order by telling me what you need, for example: 'I need 2 pallets of Ardagh bordeaux bottles'."

USER MESSAGE:
"${input.message}"

AVAILABLE PRODUCTS CATALOG (JSON):
"${input.availableProductsJson}"
`;
    
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: prompt,
      output: {
        format: 'json',
        schema: WhatsappOrderOutputSchema,
      },
    });

    return output || { items: [], reply: "I'm sorry, I wasn't able to process that request. Please try rephrasing your order." };
  }
);


export async function processWhatsappOrder(input: Pick<WhatsappOrderInput, 'message'>): Promise<WhatsappOrderOutput> {
    const products = await getProducts();
    const availableProductsJson = JSON.stringify(products);
    
    return processWhatsappOrderFlow({
        message: input.message,
        availableProductsJson: availableProductsJson
    });
}
