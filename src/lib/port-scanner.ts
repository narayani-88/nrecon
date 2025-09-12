import { PortScanResult } from '@/lib/types';
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);

// Common ports to scan
const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 389, 443, 445, 993, 995, 1433, 1521, 2049, 3306, 3389, 5432, 5900, 5985, 5986, 6379, 7001, 8000, 8009, 8080, 8081, 8443, 9000, 9090, 9200, 11211, 27017];

/**
 * Finds the path to nmap executable
 */
async function findNmapPath(): Promise<string> {
  const isWindows = platform() === 'win32';
  const testCommand = isWindows ? '--version' : '--version';
  
  // Common paths to check
  const pathsToCheck = [
    'nmap',  // Try PATH first
    ...(isWindows ? [
      'C:\\Program Files\\Nmap\\nmap.exe',
      'C:\\Program Files (x86)\\Nmap\\nmap.exe',
      'C:\\Program Files\\Nmap\\nmap',
      'C:\\Program Files (x86)\\Nmap\\nmap',
    ] : [
      '/usr/bin/nmap',
      '/usr/local/bin/nmap',
      '/opt/local/bin/nmap',
      '/usr/sbin/nmap',
    ])
  ];

  // Try each path
  for (const path of pathsToCheck) {
    try {
      const command = `"${path}" ${testCommand}`;
      const { stdout } = await execAsync(command);
      if (stdout && stdout.includes('Nmap version')) {
        console.log(`[PORT SCANNER] Found Nmap at: ${path}`);
        return path;
      }
    } catch (error) {
      // Path not found or command failed, try next one
      continue;
    }
  }

  // If we get here, nmap wasn't found in any of the expected locations
  const errorMsg = 'Nmap not found. Please ensure Nmap is installed and added to your system PATH.';
  console.error('[PORT SCANNER]', errorMsg);
  throw new Error(errorMsg);
}

/**
 * Scans common ports on the specified IP address using nmap
 * @param ip The IP address to scan
 * @returns Promise with array of port scan results
 */
export async function scanPorts(ip: string): Promise<PortScanResult[]> {
  try {
    console.log('[PORT SCANNER] Starting port scan for IP:', ip);
    
    // Find nmap executable
    const nmapPath = await findNmapPath();
    
    // Build the nmap command with a shorter timeout for testing
    const ports = COMMON_PORTS.join(',');
    const command = `"${nmapPath}" -Pn -p ${ports} --open -sV --version-intensity 5 -T4 --host-timeout 30s ${ip}`;
    
    console.log(`[PORT SCANNER] Command: ${command}`);
    
    console.log(`[PORT SCANNER] Running nmap command: ${command}`);
    
    // Add timeout to prevent hanging (30 seconds)
    const timeout = 30000;
    let stdout = '';
    let stderr = '';
    
    try {
      console.log('[PORT SCANNER] Starting Nmap scan...');
      
      // Log environment information
      console.log('[PORT SCANNER] Environment:');
      console.log(`- Process PID: ${process.pid}`);
      console.log(`- Platform: ${process.platform}`);
      console.log(`- Arch: ${process.arch}`);
      console.log(`- Node version: ${process.version}`);
      
      // Execute the command with a timeout
      const startTime = Date.now();
      const result = await Promise.race([
        (async () => {
          try {
            console.log(`[PORT SCANNER] Executing command: ${command}`);
            const result = await execAsync(command, { 
              timeout,
              maxBuffer: 1024 * 1024 * 10, // 10MB buffer
              windowsHide: true,
              env: {
                ...process.env,
                PATH: process.env.PATH || ''
              }
            });
            console.log(`[PORT SCANNER] Command completed in ${(Date.now() - startTime) / 1000} seconds`);
            return result;
          } catch (execError: any) {
            console.error('[PORT SCANNER] Command execution error:', execError);
            throw execError;
          }
        })(),
        new Promise<{ stdout: string; stderr: string }>((_, reject) => 
          setTimeout(() => {
            const error = new Error(`Nmap scan timed out after ${timeout/1000} seconds`);
            console.error(`[PORT SCANNER] ${error.message}`);
            reject(error);
          }, timeout)
        )
      ]);
      
      stdout = result.stdout;
      stderr = result.stderr;
      
    } catch (error: any) {
      console.error('[PORT SCANNER] Nmap execution failed:', error);
      if (error.stdout) console.log('[PORT SCANNER] Nmap stdout:', error.stdout);
      if (error.stderr) console.error('[PORT SCANNER] Nmap stderr:', error.stderr);
      
      // Try to get more detailed error information
      if (error.code) console.error(`[PORT SCANNER] Error code: ${error.code}`);
      if (error.signal) console.error(`[PORT SCANNER] Signal: ${error.signal}`);
      if (error.cmd) console.error(`[PORT SCANNER] Command: ${error.cmd}`);
      
      throw new Error(`Nmap execution failed: ${error.message}`);
    }
    
    if (stderr) {
      console.warn('[PORT SCANNER] nmap stderr:', stderr);
      if (stderr.includes('WARNING:') && !stderr.includes('No exact OS matches')) {
        throw new Error(`Nmap error: ${stderr}`);
      }
    }
    
    if (!stdout) {
      throw new Error('No output received from Nmap');
    }
    
    console.log('[PORT SCANNER] nmap output received');
    
    // Parse nmap output
    const results: PortScanResult[] = [];
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      // Match port lines like: 80/tcp open  http    nginx 1.18.0 (Ubuntu)
      const portMatch = line.match(/^(\d+)\/(tcp|udp)\s+(\w+)\s+(\S+)(?:\s+(.+))?/);
      
      if (portMatch) {
        const portStr = portMatch[1];
        const protocol = portMatch[2] as 'tcp' | 'udp';
        const status = portMatch[3];
        const service = portMatch[4];
        const banner = portMatch[5] || '';
        
        // Only include open ports
        if (status.toLowerCase() === 'open') {
          results.push({
            port: parseInt(portStr, 10),
            protocol,
            status: 'open',
            service: service.toLowerCase(),
            banner: banner.trim()
          });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Port scan failed:', error);
    throw new Error('Failed to perform port scan');
  }
}
