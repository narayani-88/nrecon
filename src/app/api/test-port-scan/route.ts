import { NextResponse } from 'next/server';
import { scanPorts } from '@/lib/port-scanner';

export async function GET() {
  try {
    // Test with localhost
    const target = '127.0.0.1';
    console.log(`[TEST] Starting port scan for ${target}`);
    
    // Add detailed logging
    console.log('[TEST] Environment:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- PATH:', process.env.PATH);
    
    // Test Nmap availability
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      console.log('[TEST] Testing Nmap availability...');
      const { stdout: version } = await execAsync('nmap --version');
      console.log('[TEST] Nmap version:', version.split('\n')[0]);
    } catch (e: any) {
      console.error('[TEST] Nmap test failed:', e);
      throw new Error(`Nmap test failed: ${e.message}`);
    }
    
    console.log('[TEST] Starting port scan...');
    const results = await scanPorts(target);
    
    console.log('[TEST] Port scan completed successfully');
    return NextResponse.json({
      success: true,
      target,
      results,
      message: 'Port scan completed successfully'
    });
    
  } catch (error: any) {
    console.error('[TEST] Port scan failed:', error);
    
    // Get more detailed error information
    const errorInfo = {
      message: error.message,
      name: error.name,
      code: error.code,
      syscall: error.syscall,
      path: error.path,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })
    };
    
    return NextResponse.json({
      success: false,
      error: errorInfo,
      message: 'Port scan failed. Check server logs for details.'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
