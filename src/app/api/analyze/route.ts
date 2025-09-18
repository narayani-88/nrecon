import { NextRequest, NextResponse } from 'next/server';
import { analyzeScanResults, AnalyzeScanResultsInput } from '@/ai/flows/risk-assessment-and-reporting';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeScanResultsInput = await request.json();
    
    // Validate the input
    if (!body.scanResults || !Array.isArray(body.scanResults)) {
      return NextResponse.json(
        { error: 'Invalid input: scanResults array is required' },
        { status: 400 }
      );
    }

    // Call the AI analysis
    const result = await analyzeScanResults(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    
    // Return a fallback response if AI fails
    const fallbackResponse = {
      riskAssessments: [
        {
          finding: 'Scan completed successfully',
          riskLevel: 'Low' as const,
          remediation: 'Review the scan results manually for any security concerns.'
        }
      ],
      summary: 'AI analysis is temporarily unavailable. Please review the scan results manually.'
    };
    
    return NextResponse.json(fallbackResponse);
  }
}
