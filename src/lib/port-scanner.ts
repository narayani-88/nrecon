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
  
  console.log('[PORT SCANNER] Looking for Nmap installation...');
  
  // Common paths to check
  const pathsToCheck = [
    // Try PATH first
    'nmap',
    // Windows specific paths
    ...(isWindows ? [
      // Common installation paths
      'C:\\Program Files\\Nmap\\nmap.exe',
      'C:\\Program Files (x86)\\Nmap\\nmap.exe',
      // Try with different drive letters
      'D:\\Program Files\\Nmap\\nmap.exe',
      'D:\\Program Files (x86)\\Nmap\\nmap.exe',
      // Try with short path names
      'C:\\PROGRA~1\\Nmap\\nmap.exe',
      'C:\\PROGRA~2\\Nmap\\nmap.exe',
      // Try with quotes
      '"C:\\Program Files\\Nmap\\nmap.exe"',
      '"C:\\Program Files (x86)\\Nmap\\nmap.exe"'
    ] : [
      // Unix/Linux/Mac paths
      '/usr/bin/nmap',
      '/usr/local/bin/nmap',
      '/opt/local/bin/nmap',
      '/usr/sbin/nmap',
      '/bin/nmap',
      '/sbin/nmap'
    ])
  ];

  // Try each path
  for (const path of pathsToCheck) {
    try {
      const command = path.includes(' ') && !path.startsWith('"') 
        ? `"${path}" ${testCommand}` 
        : `${path} ${testCommand}`;
        
      console.log(`[PORT SCANNER] Trying: ${command}`);
      
      const { stdout, stderr } = await execAsync(command, { windowsHide: true });
      
      if (stdout && (stdout.includes('Nmap version') || stdout.includes('Nmap [Vv]ersion'))) {
        const cleanPath = path.replace(/^"|"$/g, '');
        console.log(`[PORT SCANNER] Found Nmap at: ${cleanPath}`);
        return cleanPath;
      }
      
      if (stderr) {
        console.log(`[PORT SCANNER] Warning for ${path}: ${stderr.trim()}`);
      }
      
    } catch (error: any) {
      console.log(`[PORT SCANNER] Path not found: ${path} - ${error.message}`);
      continue;
    }
  }

  // If we get here, nmap wasn't found in any of the expected locations
  const errorMsg = `Nmap not found. Running in limited mode.\n\n` +
    `For full functionality, please install Nmap:\n` +
    `1. Download from https://nmap.org/download.html\n` +
    `2. Run the installer with default settings\n` +
    `3. Make sure to check "Add Nmap to PATH" during installation\n` +
    `4. Restart your terminal`;
    
  console.warn('[PORT SCANNER]', errorMsg);
  
  // Return a mock path that will be handled by the scanPorts function
  return 'nmap-not-found';
}

/**
 * Scans common ports on the specified IP address using nmap
 * @param ip The IP address to scan
 * @returns Promise with array of port scan results
 */
// Mock scan results for when Nmap is not available
const MOCK_SCAN_RESULTS: PortScanResult[] = [
  {
    port: 80,
    status: 'open',
    state: 'open',
    service: 'http',
    version: 'Apache/2.4.41 (Ubuntu)',
    protocol: 'tcp',
    isMock: true
  },
  {
    port: 443,
    status: 'open',
    state: 'open',
    service: 'https',
    version: 'Apache/2.4.41 (Ubuntu)',
    protocol: 'tcp',
    isMock: true
  },
  {
    port: 22,
    status: 'open',
    state: 'open',
    service: 'ssh',
    version: 'OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)',
    protocol: 'tcp',
    isMock: true
  }
];

export async function scanPorts(ip: string): Promise<PortScanResult[]> {
  try {
    console.log('[PORT SCANNER] Starting port scan for IP:', ip);
    
    // Find nmap executable
    const nmapPath = await findNmapPath();
    
    // If Nmap is not found, return mock data
    if (nmapPath === 'nmap-not-found') {
      console.warn('[PORT SCANNER] Running in mock mode - using sample data');
      return MOCK_SCAN_RESULTS;
    }
    
    // Build the nmap command with a shorter timeout for testing
    const ports = COMMON_PORTS.join(',');
    const command = nmapPath.includes(' ') && !nmapPath.startsWith('"')
      ? `"${nmapPath}" -Pn -p ${ports} --open -sV --version-intensity 5 -T4 --host-timeout 30s ${ip}`
      : `${nmapPath} -Pn -p ${ports} --open -sV --version-intensity 5 -T4 --host-timeout 30s ${ip}`;
    
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
