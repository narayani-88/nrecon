import { PortScanResult } from '@/lib/types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Common ports to scan
const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 389, 443, 445, 993, 995, 1433, 1521, 2049, 3306, 3389, 5432, 5900, 5985, 5986, 6379, 7001, 8000, 8009, 8080, 8081, 8443, 9000, 9090, 9200, 11211, 27017];

/**
 * Scans common ports on the specified IP address using nmap
 * @param ip The IP address to scan
 * @returns Promise with array of port scan results
 */
export async function scanPorts(ip: string): Promise<PortScanResult[]> {
  try {
    console.log('[PORT SCANNER] Starting port scan for IP:', ip);
    
    // Check if nmap is installed and accessible
    try {
      const { stdout: versionOutput } = await execAsync('nmap --version');
      console.log('[PORT SCANNER] Nmap version:', versionOutput.split('\n')[0]);
    } catch (e) {
      const errorMsg = 'nmap is not installed or not in PATH. Please install nmap and ensure it is in your system PATH.';
      console.error('[PORT SCANNER]', errorMsg);
      throw new Error(errorMsg);
    }

    // Build the nmap command with full path to nmap
    const ports = COMMON_PORTS.join(',');
    const nmapPath = 'C:\\Program Files (x86)\\Nmap\\nmap.exe';
    const command = `"${nmapPath}" -Pn -p ${ports} --open -sV --version-intensity 5 -T4 ${ip}`;
    
    console.log(`[PORT SCANNER] Running nmap command: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.warn('[PORT SCANNER] nmap stderr:', stderr);
    }
    
    console.log('[PORT SCANNER] nmap stdout:', stdout);
    
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
