'use server';

import { analyzeScanResults, AnalyzeScanResultsInput } from '@/ai/flows/risk-assessment-and-reporting';
import { DnsRecord, FullScanResult, GeoIpData, PortScanResult, ScanData, WhoisData } from '@/lib/types';
import { z } from 'zod';

const targetSchema = z.string().min(1, 'Target cannot be empty.');

// Mock data generation helpers
const MOCK_PORTS_TO_SCAN = [21, 22, 25, 80, 110, 143, 443, 3306, 3389, 5432, 8080];
const MOCK_DNS_RECORDS: Omit<DnsRecord, 'ttl'>[] = [
  { type: 'A', value: '142.250.191.78' },
  { type: 'AAAA', value: '2607:f8b0:4005:805::200e' },
  { type: 'MX', value: '10 smtp.google.com' },
  { type: 'NS', value: 'ns1.google.com' },
  { type: 'TXT', value: '"v=spf1 include:_spf.google.com ~all"' },
];
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
  if (target.match(/^\d{1,3}(\.\d{1,3}){3}$/)) return []; // No DNS for IP
  return MOCK_DNS_RECORDS.map(r => ({...r, ttl: Math.floor(Math.random() * 3600)}));
};

const simulateWhois = (target: string): WhoisData | null => {
   if (target.match(/^\d{1,3}(\.\d{1,3}){3}$/)) return null; // No WHOIS for IP
   return MOCK_WHOIS;
}

const simulatePortScan = (): PortScanResult[] => {
  return MOCK_PORTS_TO_SCAN.map(port => {
    const isOpen = Math.random() > 0.6; // 40% chance of being open
    if (isOpen) {
      let service = 'unknown';
      let banner = 'Generic Banner - Service ' + port;
      if (port === 80) { service = 'http'; banner = 'nginx/1.18.0';}
      if (port === 443) { service = 'https'; banner = 'OpenSSL/1.1.1f';}
      if (port === 22) { service = 'ssh'; banner = 'OpenSSH_8.2p1 Ubuntu-4ubuntu0.1';}
      if (port === 3306) { service = 'mysql'; banner = 'MySQL 8.0.22';}
      return { port, protocol: 'tcp', status: 'open', service, banner };
    }
    return { port, protocol: 'tcp', status: Math.random() > 0.2 ? 'closed' : 'filtered' };
  });
};

export async function performScan(
  target: string
): Promise<{ success: true; data: FullScanResult } | { success: false; error: string }> {
  try {
    const validatedTarget = targetSchema.parse(target);

    // 1. Simulate data gathering
    const isOnline = simulatePing();
    const ports = simulatePortScan();
    // Always perform DNS and WHOIS on the original target
    const dns = simulateDnsLookup(validatedTarget);
    const whois = simulateWhois(validatedTarget);
    
    // Resolve IP for other uses, but use original target for DNS/WHOIS
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
    };

    // 2. Prepare data for AI analysis
    const aiInput: AnalyzeScanResultsInput = {
      scanResults: scanData.ports
        .filter(p => p.status === 'open')
        .map(p => {
          let severity: 'Low' | 'Medium' | 'High' = 'Low';
          if ([80, 443].includes(p.port)) severity = 'Medium';
          if ([22, 3389, 3306].includes(p.port)) severity = 'High';
          
          return {
            description: `Port ${p.port}/${p.protocol} (${p.service}) is open.`,
            severity,
            details: { banner: p.banner || 'N/A' },
          };
        }),
    };
    
    // Add DNS and WHOIS info to AI input if available
    if (dns.length > 0) {
        aiInput.scanResults.push({
            description: 'Public DNS records found.',
            severity: 'Low',
            details: { banner: dns.map(r => `${r.type}: ${r.value}`).join(', ') }
        });
    }
     if (whois) {
        aiInput.scanResults.push({
            description: 'WHOIS information is public.',
            severity: 'Low',
            details: { banner: `Registrar: ${whois.registrar}` }
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
