'use server';

/**
 * @fileOverview Provides AI-driven shopping suggestions based on the current shopping list.
 *
 * - getAIShoppingSuggestions - A function that retrieves AI shopping suggestions.
 * - AIShoppingSuggestionsInput - The input type for the getAIShoppingSuggestions function.
 * - AIShoppingSuggestionsOutput - The return type for the getAIShoppingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIShoppingSuggestionsInputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
        type: z.string(),
      })
    )
    .describe('The current list of items in the shopping cart.'),
  budget: z.number().describe('The total budget for the shopping trip.'),
  remainingBudget: z
    .number()
    .describe('The remaining budget after adding the current items.'),
});
export type AIShoppingSuggestionsInput = z.infer<
  typeof AIShoppingSuggestionsInputSchema
>;

const AIShoppingSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested items to add to the shopping list.'),
});
export type AIShoppingSuggestionsOutput = z.infer<
  typeof AIShoppingSuggestionsOutputSchema
>;

export async function getAIShoppingSuggestions(
  input: AIShoppingSuggestionsInput
): Promise<AIShoppingSuggestionsOutput> {
  return aiShoppingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiShoppingSuggestionsPrompt',
  input: {schema: AIShoppingSuggestionsInputSchema},
  output: {schema: AIShoppingSuggestionsOutputSchema},
  prompt: `You are a helpful shopping assistant. Given the current shopping list and remaining budget, suggest some items that the user might want to add to their list.

  Consider the user's budget and try to suggest items that are within their price range.
  Do not suggest items that are already in the list.

  Current Shopping List:
  {{#each items}}
  - {{name}} (Quantity: {{quantity}}, Price: {{price}}, Type: {{type}})
  {{/each}}

  Budget: {{budget}}
  Remaining Budget: {{remainingBudget}}

  Suggestions:
  `,
});

const aiShoppingSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiShoppingSuggestionsFlow',
    inputSchema: AIShoppingSuggestionsInputSchema,
    outputSchema: AIShoppingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
