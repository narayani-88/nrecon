import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const report = await request.json();
    console.log('CSP Violation Report:', JSON.stringify(report, null, 2));
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing CSP violation report:', error);
    return NextResponse.json(
      { error: 'Error processing report' },
      { status: 400 }
    );
  }
}
