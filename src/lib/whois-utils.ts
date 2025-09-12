import { exec } from 'child_process';
import { promisify } from 'util';
import { WhoisData } from '@/lib/types';

const execAsync = promisify(exec);

export async function lookupWhois(domain: string): Promise<WhoisData | null> {
  try {
    // First, check if whois is installed
    try {
      await execAsync('whois --version');
    } catch (e) {
      console.error('whois command not found. Please install whois package.');
      return null;
    }

    // Execute whois command
    const { stdout, stderr } = await execAsync(`whois ${domain}`);
    
    if (stderr) {
      console.error('WHOIS lookup error:', stderr);
      return null;
    }

    // Parse the WHOIS data
    const whoisText = stdout.toString();
    
    // Extract registrar
    const registrarMatch = whoisText.match(/Registrar: (.+)/i) || 
                         whoisText.match(/Registrar WHOIS Server: (.+)/i);
    
    // Extract creation date
    const creationDateMatch = whoisText.match(/Creation Date: (.+)/i) || 
                            whoisText.match(/Created On: (.+)/i) ||
                            whoisText.match(/Registered: (.+)/i);
    
    // Extract expiration date
    const expirationDateMatch = whoisText.match(/Expiration Date: (.+)/i) || 
                              whoisText.match(/Registry Expiry Date: (.+)/i) ||
                              whoisText.match(/Expires: (.+)/i);
    
    return {
      registrar: registrarMatch ? registrarMatch[1].trim() : null,
      creationDate: creationDateMatch ? new Date(creationDateMatch[1].trim()).toISOString() : null,
      expirationDate: expirationDateMatch ? new Date(expirationDateMatch[1].trim()).toISOString() : null,
      raw: whoisText
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return null;
  }
}
