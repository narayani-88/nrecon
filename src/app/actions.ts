'use server';

import { analyzeScanResults, AnalyzeScanResultsInput } from '@/ai/flows/risk-assessment-and-reporting';
import { DnsRecord, FullScanResult, GeoIpData, PortScanResult, ScanData, WhoisData, Technology, ExposedService } from '@/lib/types';
import { z } from 'zod';
import { scanPorts } from '@/lib/port-scanner';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const targetSchema = z.string().min(1, 'Target cannot be empty.');

// Mock data generation helpers
const MOCK_PORTS_TO_SCAN = [21, 22, 25, 80, 110, 143, 443, 3306, 3389, 5432, 8080];
const MOCK_DNS_RECORDS: Omit<DnsRecord, 'ttl'>[] = [
  { type: 'A', value: '142.250.191.78' },
  { type: 'AAAA', value: '2607:f8b0:4005:805::200e' },
  { type: 'MX', value: '10 smtp.google.com' },
  { type: 'NS', value: 'ns1.google.com' },
  { type: 'TXT', value: '"v=spf1 include:_spf.google.com ~all"' },
  { type: 'CNAME', value: 'www.google.com'},
];
const MOCK_SUBDOMAINS = ['www', 'mail', 'api', 'dev', 'blog', 'shop'];
const MOCK_TECHNOLOGIES: Technology[] = [
    { name: 'React', category: 'Frontend', version: '18.2.0' },
    { name: 'Next.js', category: 'Frontend', version: '14.1.0' },
    { name: 'Node.js', category: 'Backend', version: '20.11.0' },
    { name: 'nginx', category: 'Web Server', version: '1.25.3' },
];
// Function to check for common CVEs based on service and version
async function checkForCVEs(service: string, version: string): Promise<string[]> {
  // This is a simplified example. In a real app, you would query a CVE database
  const cveMap: Record<string, Record<string, string[]>> = {
    'nginx': {
      '1.18.0': ['CVE-2021-23017', 'CVE-2020-12440'],
      '1.16.0': ['CVE-2019-20372', 'CVE-2020-12440']
    },
    'openssl': {
      '1.1.1f': ['CVE-2021-3449', 'CVE-2021-3450', 'CVE-2021-23840']
    },
    'mysql': {
      '8.0.22': ['CVE-2021-21695', 'CVE-2021-21696', 'CVE-2021-21697']
    },
    'ssh': {
      '8.2p1': ['CVE-2020-15778', 'CVE-2020-14145']
    }
  };

  const serviceLower = service.toLowerCase();  
  const serviceKey = Object.keys(cveMap).find(key => serviceLower.includes(key));
  
  if (serviceKey && cveMap[serviceKey][version]) {
    return cveMap[serviceKey][version];
  }
  
  return [];
}

const MOCK_GEO_IP: GeoIpData = {
  country: 'United States',
  region: 'California',
  city: 'Mountain View',
  lat: 37.422,
  lon: -122.084,
};
const MOCK_WHOIS: WhoisData = {
    registrar: "MarkMonitor Inc.",
    creationDate: "1997-09-15T04:00:00.000Z",
    expirationDate: "2028-09-14T04:00:00.000Z",
    raw: `Domain Name: GOOGLE.COM
Registrar: MarkMonitor Inc.
Creation Date: 1997-09-15T04:00:00Z
Registry Expiry Date: 2028-09-14T04:00:00Z
Registrar Abuse Contact Email: abusecomplaints@markmonitor.com
Registrar Abuse Contact Phone: +1.2086851750
`
};

const simulatePing = () => Math.random() > 0.1; // 90% success rate

const simulateDnsLookup = (target: string): DnsRecord[] => {
  if (target.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
    return [];
  }
  return MOCK_DNS_RECORDS.map(r => ({...r, ttl: Math.floor(Math.random() * 3600)}));
};

const simulateSubdomainEnum = (target: string): string[] => {
    if (target.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
        return [];
    }
    return MOCK_SUBDOMAINS.map(sub => `${sub}.${target}`);
}

const simulateWhois = (target: string): WhoisData | null => {
   if (target.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
    return null;
   }
   return MOCK_WHOIS;
}

async function getExposedServices(openPorts: PortScanResult[]): Promise<ExposedService[]> {
  const exposedServices: ExposedService[] = [];
  
  for (const port of openPorts) {
    if (port.status === 'open' && port.service && port.banner) {
      // Extract version from banner if possible
      const versionMatch = port.banner.match(/(\d+(\.\d+)+)/);
      const version = versionMatch ? versionMatch[0] : 'unknown';
      
      // Get CVEs for this service
      const cves = await checkForCVEs(port.service, version);
      
      exposedServices.push({
        port: port.port,
        service: port.service,
        version: version,
        potentialCVE: cves.length > 0 ? cves[0] : undefined,
        allCVEs: cves.length > 0 ? cves : undefined
      });
    }
  }
  
  return exposedServices;
}

export async function performScan(
  target: string
): Promise<{ success: true; data: FullScanResult } | { success: false; error: string }> {
  try {
    const validatedTarget = targetSchema.parse(target);

    // 1. Perform actual scans
    const isOnline = true; // Assume online for now
    const ports = await scanPorts(validatedTarget);
    const openPorts = ports.filter(p => p.status === 'open');
    
    // Always perform lookups on the original validated target
    const dns = simulateDnsLookup(validatedTarget);
    const whois = simulateWhois(validatedTarget);
    const subdomains = simulateSubdomainEnum(validatedTarget);
    
    // Determine the IP address. Use the 'A' record if available, otherwise check if the target itself is an IP.
    const ip = dns.find(r => r.type === 'A')?.value || (validatedTarget.match(/^\d{1,3}(\.\d{1,3}){3}$/) ? validatedTarget : 'N/A');
    const geoIp = isOnline ? MOCK_GEO_IP : null;

    const scanData: ScanData = {
      target: validatedTarget,
      ip,
      timestamp: new Date().toISOString(),
      isOnline,
      ports,
      dns,
      whois,
      geoIp,
technologies: isOnline ? MOCK_TECHNOLOGIES : [],
      subdomains,
      exposedServices: isOnline ? await getExposedServices(openPorts) : [],
    };

    // 2. Prepare data for AI analysis
    const aiInput: AnalyzeScanResultsInput = {
      scanResults: [],
    };
    
    // Add open ports to AI input
    scanData.ports
      .filter(p => p.status === 'open')
      .forEach(p => {
        let severity: 'Low' | 'Medium' | 'High' = 'Low';
        if ([80, 443].includes(p.port)) severity = 'Medium';
        if ([22, 3389, 3306].includes(p.port)) severity = 'High';
        
        aiInput.scanResults.push({
          description: `Port ${p.port}/${p.protocol} (${p.service}) is open.`,
          severity,
          details: { banner: p.banner || 'N/A' },
        });
      });
    
    // Add DNS and WHOIS info to AI input if available
    if (scanData.dns.length > 0) {
        aiInput.scanResults.push({
            description: 'Public DNS records found.',
            severity: 'Low',
            details: { banner: dns.map(r => `${r.type}: ${r.value}`).join(', ') }
        });
    }
     if (scanData.whois) {
        aiInput.scanResults.push({
            description: 'WHOIS information is public.',
            severity: 'Low',
            details: { banner: `Registrar: ${scanData.whois.registrar || 'Unknown'}` }
        });
    }

    if (scanData.subdomains.length > 0) {
        aiInput.scanResults.push({
            description: 'Subdomains discovered.',
            severity: 'Low',
            details: { banner: `Found subdomains: ${scanData.subdomains.join(', ')}`}
        });
    }

    if (scanData.technologies.length > 0) {
        aiInput.scanResults.push({
            description: 'Technology stack identified.',
            severity: 'Low',
            details: { banner: `Technologies: ${scanData.technologies.map(t => `${t.name} ${t.version || ''}`).join(', ')}`}
        });
    }

     if (scanData.exposedServices.length > 0) {
        scanData.exposedServices.forEach(s => {
            aiInput.scanResults.push({
                description: `Exposed service ${s.service} on port ${s.port}.`,
                severity: 'High',
                details: { banner: `Version: ${s.version}, Potential Vulnerability: ${s.potentialCVE || 'N/A'}`}
            });
        });
    }


    // 3. Call GenAI Flow
    const aiAnalysis = await analyzeScanResults(aiInput);

    const fullResult: FullScanResult = {
      id: `${validatedTarget}-${Date.now()}`,
      scanData,
      aiAnalysis,
    };

    return { success: true, data: fullResult };
  } catch (error) {
    console.error('Scan failed:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'An unexpected error occurred during the scan.' };
  }
}
