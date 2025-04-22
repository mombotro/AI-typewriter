'use server';
/**
 * @fileOverview A text continuation AI agent.
 *
 * - textContinuation - A function that handles the text continuation process.
 * - TextContinuationInput - The input type for the textContinuation function.
 * - TextContinuationOutput - The return type for the textContinuation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TextContinuationInputSchema = z.object({
  existingText: z.string().describe('The existing text to continue from.'),
});
export type TextContinuationInput = z.infer<typeof TextContinuationInputSchema>;

const TextContinuationOutputSchema = z.object({
  continuedText: z.string().describe('The AI-generated continuation of the text.'),
});
export type TextContinuationOutput = z.infer<typeof TextContinuationOutputSchema>;

export async function textContinuation(input: TextContinuationInput): Promise<TextContinuationOutput> {
  return textContinuationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textContinuationPrompt',
  input: {
    schema: z.object({
      existingText: z.string().describe('The existing text to continue from.'),
    }),
  },
  output: {
    schema: z.object({
      continuedText: z.string().describe('The AI-generated continuation of the text.'),
    }),
  },
  prompt: `Continue the following text, maintaining the style, tone, and direction of the existing content:\n\n{{{existingText}}}`,
});

const textContinuationFlow = ai.defineFlow<
  typeof TextContinuationInputSchema,
  typeof TextContinuationOutputSchema
>({
  name: 'textContinuationFlow',
  inputSchema: TextContinuationInputSchema,
  outputSchema: TextContinuationOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
