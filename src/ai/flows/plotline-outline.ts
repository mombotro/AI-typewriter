'use server';
/**
 * @fileOverview Generates a plotline outline based on the existing context and a predefined template.
 *
 * - plotlineOutline - A function that generates the plotline outline.
 * - PlotlineOutlineInput - The input type for the plotlineOutline function.
 * - PlotlineOutlineOutput - The return type for the plotlineOutline function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const PlotlineOutlineInputSchema = z.object({
  context: z.string().describe('The writing context to base the plotline outline on.'),
});

export type PlotlineOutlineInput = z.infer<typeof PlotlineOutlineInputSchema>;

const PlotlineOutlineOutputSchema = z.object({
  outline: z.string().describe('The generated plotline outline.'),
});

export type PlotlineOutlineOutput = z.infer<typeof PlotlineOutlineOutputSchema>;

export async function plotlineOutline(input: PlotlineOutlineInput): Promise<PlotlineOutlineOutput> {
  return plotlineOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plotlineOutlinePrompt',
  input: {
    schema: z.object({
      context: z.string().describe('The writing context to base the plotline outline on.'),
    }),
  },
  output: {
    schema: z.object({
      outline: z.string().describe('The generated plotline outline.'),
    }),
  },
  prompt: `You are an AI writing assistant that specializes in creating plotline outlines. Based on the context provided, generate a detailed plotline outline following the template below.

# Concise Plotline Outline Template

## Core Elements

### Protagonist
- **Identity**: Name, key attributes, defining experiences
- **Internal Contradiction**: Central personality tension
- **Core Fear/Desire**: What drives them at the deepest level

### World
- **Setting**: Time, place, and atmosphere
- **Social Context**: Power structures and cultural forces
- **Limitations**: Boundaries creating narrative challenges

### Central Conflict
- **External Problem**: Visible challenge to overcome
- **Internal Struggle**: Psychological barrier
- **Thematic Question**: Central philosophical inquiry

## Plot Structure

### Act I: Beginning (10-15%)
1. **Ordinary World**: Status quo before disruption
2. **Inciting Incident**: Event that begins the journey
3. **First Threshold**: Initial commitment to change

### Act II-A: Complications (25-30%)
4. **Reaction**: Adapting to new circumstances
5. **First Challenge**: Testing abilities with partial success
6. **Midpoint Revelation**: Game-changing discovery

### Act II-B: Escalation (25-30%)
7. **Raised Stakes**: Consequences become more serious
8. **False Victory/Defeat**: Temporary resolution then worsening
9. **Darkest Moment**: Protagonist's lowest point

### Act III: Resolution (15-20%)
10. **New Determination**: Finding renewed purpose
11. **Climactic Confrontation**: Direct address of central conflict
12. **Resolution**: How protagonist and world are changed

## Key Characters

- **Antagonist**: Opposition force and thematic counterpoint
- **Ally/Mentor**: Supports protagonist's journey
- **Relationship Character**: Creates emotional complexity
- **Complicating Character**: Introduces productive obstacles

## Turning Points
- **25% Mark**: First major shift in direction
- **50% Mark**: Revelation that changes everything
- **75% Mark**: Final approach to resolution begins

Context:
{{{context}}}

Outline:
`,
});

const plotlineOutlineFlow = ai.defineFlow<
  typeof PlotlineOutlineInputSchema,
  typeof PlotlineOutlineOutputSchema
>({
  name: 'plotlineOutlineFlow',
  inputSchema: PlotlineOutlineInputSchema,
  outputSchema: PlotlineOutlineOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
