'use server';

/**
 * @fileOverview Implements visual search functionality, allowing users to upload an image and find similar collectibles.
 *
 * - visualSearch - A function that takes an image data URI and returns similar collectibles.
 * - VisualSearchInput - The input type for the visualSearch function.
 * - VisualSearchOutput - The return type for the visualSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualSearchInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a collectible, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VisualSearchInput = z.infer<typeof VisualSearchInputSchema>;

const VisualSearchOutputSchema = z.object({
  collectibles: z.array(
    z.object({
      name: z.string().describe('The name of the collectible.'),
      description: z.string().describe('A short description of the collectible.'),
      imageUrl: z.string().describe('URL of the collectible image.'),
    })
  ).describe('A list of similar collectibles found in the store.'),
});
export type VisualSearchOutput = z.infer<typeof VisualSearchOutputSchema>;

export async function visualSearch(input: VisualSearchInput): Promise<VisualSearchOutput> {
  return visualSearchFlow(input);
}

const visualSearchPrompt = ai.definePrompt({
  name: 'visualSearchPrompt',
  input: {schema: VisualSearchInputSchema},
  output: {schema: VisualSearchOutputSchema},
  prompt: `You are an AI assistant that helps users find similar collectibles based on an image they upload.

  Analyze the image provided and identify key features and characteristics of the collectible.
  Then, search for similar collectibles in the store and return a list of the most relevant results.

  The image is provided as a data URI. Use the {{media url=photoDataUri}} Handlebars helper to process the image.

  Return the results as a JSON array of collectibles, including their name, description, and image URL.
  `,
});

const visualSearchFlow = ai.defineFlow(
  {
    name: 'visualSearchFlow',
    inputSchema: VisualSearchInputSchema,
    outputSchema: VisualSearchOutputSchema,
  },
  async input => {
    const {output} = await visualSearchPrompt(input);
    return output!;
  }
);
