'use server';
/**
 * @fileOverview Provides contextual suggestions for character development, plot ideas, scene breakdowns, and story arcs.
 *
 * - contextualSuggestions - A function that generates contextual suggestions based on user requests.
 * - ContextualSuggestionsInput - The input type for the contextualSuggestions function.
 * - ContextualSuggestionsOutput - The return type for the ContextualSuggestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ContextualSuggestionsInputSchema = z.object({
  request: z.string().describe('The user request for a suggestion (e.g., character development, plot idea).'),
  context: z.string().describe('The current writing context (e.g., current scene, character descriptions).'),
  apiKey: z.string().describe('The API key to use for the contextual suggestions.'),
});
export type ContextualSuggestionsInput = z.infer<typeof ContextualSuggestionsInputSchema>;

const ContextualSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      suggestion: z.string().describe('A suggested idea.'),
      reasoning: z.string().describe('The reasoning behind the suggestion.'),
    })
  ).describe('A ranked list of contextual suggestions.'),
});
export type ContextualSuggestionsOutput = z.infer<typeof ContextualSuggestionsOutputSchema>;

export async function contextualSuggestions(input: ContextualSuggestionsInput): Promise<ContextualSuggestionsOutput> {
  return contextualSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualSuggestionsPrompt',
  input: {
    schema: z.object({
      request: z.string().describe('The user request for a suggestion (e.g., character development, plot idea).'),
      context: z.string().describe('The current writing context (e.g., current scene, character descriptions).'),
      apiKey: z.string().describe('The API key to use for the contextual suggestions.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.array(
        z.object({
          suggestion: z.string().describe('A suggested idea.'),
          reasoning: z.string().describe('The reasoning behind the suggestion.'),
        })
      ).describe('A ranked list of contextual suggestions.'),
    }),
  },
  prompt: `You are a creative writing assistant. The user is requesting suggestions based on the current context.

  Request: {{{request}}}
  Context: {{{context}}}

  Generate a ranked list of suggestions, with reasoning for each suggestion. The list should be an array of objects with suggestion and reasoning fields.
  Each suggestion should be unique.
`,
});

const contextualSuggestionsFlow = ai.defineFlow<
  typeof ContextualSuggestionsInputSchema,
  typeof ContextualSuggestionsOutputSchema
>({
  name: 'contextualSuggestionsFlow',
  inputSchema: ContextualSuggestionsInputSchema,
  outputSchema: ContextualSuggestionsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
