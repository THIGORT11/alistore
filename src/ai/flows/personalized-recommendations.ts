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
      'A comma separated list of product ids representing the user browsing history.'
    ),
  interests: z
    .string()
    .describe('A comma separated list of interests of the user'),
  numberOfRecommendations: z
    .number()
    .describe('The number of collectibles to recommend.')
    .default(3),
});
export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommended collectible product IDs.'),
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
  prompt: `You are an expert collectible recommendation system.

    Based on the user's browsing history and interests, you will provide a list of collectible product IDs that the user might be interested in.

    User Browsing History: {{{browsingHistory}}}
    User Interests: {{{interests}}}

    Return ONLY {{numberOfRecommendations}} product IDs.

    The response must be a JSON array of product IDs.
    Ensure that the product IDs you return are comma seperated.`,
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
