import { z } from 'zod';

export const ScrapedProductSchema = z.object({
  name: z.string().describe('The full name of the product.'),
  price: z.number().optional().describe('The price of the product.'),
  description: z.string().optional().describe('A detailed description of the product.'),
  imageUrl: z.string().url().optional().describe('A direct URL to the product image.'),
  category: z.string().optional().describe('The product category or sub-category. If a sub-category context is provided below, you MUST use it for this field.'),
  supplier: z.string().optional().describe('The name of the supplier.'),
  aiHint: z.string().optional().describe('An AI hint for image generation.'),
});

export const ScrapeCatalogInputSchema = z.object({
  htmlContent: z.string().describe("The full HTML source code of the supplier's product page."),
  subCategory: z.string().optional().describe('An optional sub-category to provide context for the products being scraped.'),
});

export const ScrapeCatalogOutputSchema = z.object({
  products: z.array(ScrapedProductSchema),
});

export const SalesStrategySuggestionsInputSchema = z.object({
  customerType: z
    .string()
    .describe('The type of customer (e.g., enterprise, small business).'),
  product: z.string().describe('The product being sold.'),
  context: z
    .string()
    .describe(
      'Detailed context of the current sales situation, including customer needs and challenges.'
    ),
  pastSuccessfulCases: z
    .string()
    .describe(
      'Details of past successful sales cases with similar customers or products.'
    ),
});

export const SalesStrategySuggestionsOutputSchema = z.object({
  strategySuggestions: z
    .string()
    .describe(
      'AI-powered suggestions for sales strategies based on the input context and past successful cases.'
    ),
});

export const OrderItemSchema = z.object({
  id: z.string().describe("The unique ID of the product from the catalog."),
  name: z.string().describe("The full name of the product."),
  price: z.number().describe("The price per unit of the product."),
  quantity: z.number().describe("The final calculated quantity the user wants to order. For bottles, this is total units (pallets * unitsPerPallet). For screwcaps, it is total units (boxes * 1000). For others, it's just the number of units."),
  supplier: z.string().describe("The supplier of the product."),
  category: z.string().describe("The product category."),
  unitsPerPallet: z.number().optional().describe("Units per pallet, if applicable."),
  image: z.string().url().describe("The product image URL."),
  aiHint: z.string().describe("The AI hint for the image."),
});

export const WhatsappOrderInputSchema = z.object({
  message: z.string().describe("The raw text message from the user."),
  availableProductsJson: z.string().describe("A JSON string of all available products in the catalog for lookup."),
});

export const WhatsappOrderOutputSchema = z.object({
  items: z.array(OrderItemSchema).describe("An array of product items the user wants to order."),
  reply: z.string().describe("A friendly confirmation or clarification message to send back to the user."),
});
