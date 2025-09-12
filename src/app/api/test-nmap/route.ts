import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Test if nmap is accessible
    const { stdout, stderr } = await execAsync('nmap --version');
    
    return NextResponse.json({
      success: true,
      version: stdout.split('\n')[0],
      message: 'Nmap is accessible from the application'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to access Nmap. Make sure it is installed and in the system PATH.',
      stderr: error.stderr || ''
    }, { status: 500 });
  }
}
