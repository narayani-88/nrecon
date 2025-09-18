import { exec } from 'child_process';
import { promisify } from 'util';
import { WhoisData } from '@/lib/types';

const execAsync = promisify(exec);

export async function lookupWhois(domain: string): Promise<WhoisData | null> {
  try {
    // Use a WHOIS API service instead of system command for better compatibility
    const response = await fetch(`https://whois.freeapi.app/api/whois?domainName=${encodeURIComponent(domain)}`);
    
    if (!response.ok) {
      console.error('WHOIS API request failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !data.data) {
      console.error('Invalid WHOIS API response');
      return null;
    }
    
    const whoisData = data.data;
    
    return {
      registrar: whoisData.registrar || whoisData.registrar_name || null,
      creationDate: whoisData.creation_date || whoisData.created_date || null,
      expirationDate: whoisData.expiration_date || whoisData.expires_date || null,
      raw: JSON.stringify(whoisData, null, 2)
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    
    // Fallback: try alternative API
    try {
      const response = await fetch(`https://api.whois.vu/?q=${encodeURIComponent(domain)}`);
      if (response.ok) {
        const text = await response.text();
        
        // Parse basic info from text response
        const registrarMatch = text.match(/Registrar: (.+)/i);
        const creationMatch = text.match(/Creation Date: (.+)/i);
        const expirationMatch = text.match(/Expiration Date: (.+)/i);
        
        return {
          registrar: registrarMatch ? registrarMatch[1].trim() : null,
          creationDate: creationMatch ? creationMatch[1].trim() : null,
          expirationDate: expirationMatch ? expirationMatch[1].trim() : null,
          raw: text
        };
      }
    } catch (fallbackError) {
      console.error('Fallback WHOIS lookup also failed:', fallbackError);
    }
    
    return null;
  }
}
