// src/ai/flows/personalized-recommendations.ts
'use server';

/**
 * @fileOverview A personalized recommendation AI agent that suggests collectibles
 *  based on user browsing history.
 *
 * - getPersonalizedRecommendations - A function that retrieves personalized
 *       collectible recommendations for a user.
 * - PersonalizedRecommendationsInput - The input type for the
 *       getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the
 *       getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  browsingHistory: z
    .string()
    .describe(
      'Una lista de IDs de producto separados por comas que representa el historial de navegación del usuario.'
    ),
  interests: z
    .string()
    .describe('Una lista de intereses del usuario separados por comas'),
  numberOfRecommendations: z
    .number()
    .describe('El número de coleccionables a recomendar.')
    .default(3),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('Una lista de IDs de productos coleccionables recomendados.'),
});
export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `Eres un sistema experto en recomendación de coleccionables.

    Basado en el historial de navegación e intereses del usuario, proporcionarás una lista de IDs de productos coleccionables que podrían interesarle.

    Historial de Navegación del Usuario: {{{browsingHistory}}}
    Intereses del Usuario: {{{interests}}}

    Devuelve SÓLO {{numberOfRecommendations}} IDs de producto.

    La respuesta debe ser un array JSON de IDs de producto.
    Asegúrate de que los IDs de producto que devuelves estén separados por comas.`,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);
