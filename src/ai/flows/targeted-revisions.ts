// src/ai/flows/targeted-revisions.ts
'use server';

/**
 * @fileOverview Provides targeted revisions for selected text, offering alternative phrasings, grammatical fixes, and stylistic enhancements.
 *
 * - targetedRevisions - A function that handles the targeted revisions process.
 * - TargetedRevisionsInput - The input type for the targetedRevisions function.
 * - TargetedRevisionsOutput - The return type for the targetedRevisions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TargetedRevisionsInputSchema = z.object({
  selectedText: z.string().describe('The text selected by the user for revision.'),
  fullDocument: z.string().describe('The entire document content for context.'),
  revisionRequest: z.string().describe('The specific revision request from the user (e.g., rewrite, enhance, simplify).'),
});
export type TargetedRevisionsInput = z.infer<typeof TargetedRevisionsInputSchema>;

const TargetedRevisionsOutputSchema = z.object({
  revisedText: z.string().describe('The revised text based on the user request.'),
  explanation: z.string().optional().describe('An explanation of the revisions made, if any.'),
});
export type TargetedRevisionsOutput = z.infer<typeof TargetedRevisionsOutputSchema>;

export async function targetedRevisions(input: TargetedRevisionsInput): Promise<TargetedRevisionsOutput> {
  return targetedRevisionsFlow(input);
}

const targetedRevisionsPrompt = ai.definePrompt({
  name: 'targetedRevisionsPrompt',
  input: {
    schema: z.object({
      selectedText: z.string().describe('The text selected by the user for revision.'),
      fullDocument: z.string().describe('The entire document content for context.'),
      revisionRequest: z.string().describe('The specific revision request from the user (e.g., rewrite, enhance, simplify).'),
    }),
  },
  output: {
    schema: z.object({
      revisedText: z.string().describe('The revised text based on the user request.'),
      explanation: z.string().optional().describe('An explanation of the revisions made, if any.'),
    }),
  },
  prompt: `You are an advanced AI writing assistant. You will analyze the selected text within the context of the full document and provide targeted revisions based on the user's request.

Selected Text:
{{selectedText}}

Full Document:
{{fullDocument}}

Revision Request:
{{revisionRequest}}

Revised Text:`, // Removed conditional logic and direct function calls from Handlebars
});

const targetedRevisionsFlow = ai.defineFlow<
  typeof TargetedRevisionsInputSchema,
  typeof TargetedRevisionsOutputSchema
>(
  {
    name: 'targetedRevisionsFlow',
    inputSchema: TargetedRevisionsInputSchema,
    outputSchema: TargetedRevisionsOutputSchema,
  },
  async input => {
    const {output} = await targetedRevisionsPrompt(input);
    return output!;
  }
);
