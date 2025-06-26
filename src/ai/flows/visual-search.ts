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
      "Una foto de un coleccionable, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VisualSearchInput = z.infer<typeof VisualSearchInputSchema>;

const VisualSearchOutputSchema = z.object({
  collectibles: z.array(
    z.object({
      name: z.string().describe('El nombre del coleccionable.'),
      description: z.string().describe('Una breve descripción del coleccionable.'),
      imageUrl: z.string().describe('URL de la imagen del coleccionable.'),
    })
  ).describe('Una lista de coleccionables similares encontrados en la tienda.'),
});
export type VisualSearchOutput = z.infer<typeof VisualSearchOutputSchema>;

export async function visualSearch(input: VisualSearchInput): Promise<VisualSearchOutput> {
  return visualSearchFlow(input);
}

const visualSearchPrompt = ai.definePrompt({
  name: 'visualSearchPrompt',
  input: {schema: VisualSearchInputSchema},
  output: {schema: VisualSearchOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los usuarios a encontrar coleccionables similares basándose en una imagen que suben.

  Analiza la imagen proporcionada e identifica las características clave del coleccionable.
  Luego, busca coleccionables similares en la tienda y devuelve una lista de los resultados más relevantes.

  La imagen se proporciona como un URI de datos. Usa el ayudante de Handlebars {{media url=photoDataUri}} para procesar la imagen.

  Devuelve los resultados como un array JSON de coleccionables, incluyendo su nombre, descripción y URL de la imagen.
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
