'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing scan results and assessing the risk level associated with each finding.
 *
 * - analyzeScanResults - A function that analyzes scan results and assesses the risk level.
 * - AnalyzeScanResultsInput - The input type for the analyzeScanResults function.
 * - AnalyzeScanResultsOutput - The return type for the analyzeScanResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanResultSchema = z.object({
  description: z.string().describe('A description of the scan finding.'),
  severity: z.enum(['Low', 'Medium', 'High']).describe('The severity of the finding.'),
  details: z.record(z.any()).describe('Detailed information about the finding, such as a software banner, discovered subdomains, or technology versions.'),
});

const AnalyzeScanResultsInputSchema = z.object({
  scanResults: z.array(ScanResultSchema).describe('An array of scan results to analyze.'),
});
export type AnalyzeScanResultsInput = z.infer<typeof AnalyzeScanResultsInputSchema>;

const RiskAssessmentSchema = z.object({
  finding: z.string().describe('A summary of the scan finding.'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The assessed risk level of the finding.'),
  remediation: z.string().describe('A suggested remediation for the finding.'),
});

const AnalyzeScanResultsOutputSchema = z.object({
  riskAssessments: z.array(RiskAssessmentSchema).describe('An array of risk assessments for each finding.'),
  summary: z.string().describe('A summary of the overall risk assessment.'),
});
export type AnalyzeScanResultsOutput = z.infer<typeof AnalyzeScanResultsOutputSchema>;

export async function analyzeScanResults(input: AnalyzeScanResultsInput): Promise<AnalyzeScanResultsOutput> {
  return analyzeScanResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeScanResultsPrompt',
  input: {schema: AnalyzeScanResultsInputSchema},
  output: {schema: AnalyzeScanResultsOutputSchema},
  prompt: `You are a security expert analyzing a reconnaissance report to assess risk and suggest remediation.

  Analyze the following findings. For each one, assess the risk level (Low, Medium, High) and provide a concise, actionable remediation suggestion.
  Finally, provide a brief, high-level summary of the target's overall security posture based on all findings.

  Scan Findings:
  {{#each scanResults}}
  - Description: {{this.description}}
    Severity: {{this.severity}}
    Details: {{this.details.banner}}
  {{/each}}
  `,
});

const analyzeScanResultsFlow = ai.defineFlow(
  {
    name: 'analyzeScanResultsFlow',
    inputSchema: AnalyzeScanResultsInputSchema,
    outputSchema: AnalyzeScanResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
