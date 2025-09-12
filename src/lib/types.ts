import type { AnalyzeScanResultsOutput } from '@/ai/flows/risk-assessment-and-reporting';

export type GeoIpData = {
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
};

export type DnsRecord = {
  type: string;
  value: string;
  ttl: number;
};

export type WhoisData = {
  registrar: string | null;
  creationDate: string | null;
  expirationDate: string | null;
  raw: string;
};

export type PortScanResult = {
  port: number;
  protocol: 'tcp' | 'udp';
  status: 'open' | 'closed' | 'filtered';
  service?: string;
  banner?: string;
};

export type Technology = {
    name: string;
    category: 'Frontend' | 'Backend' | 'Web Server' | 'Database' | 'CMS' | 'Library';
    version: string | null;
}

export type ExposedService = {
    port: number;
    service: string;
    version: string;
    potentialCVE?: string;
    allCVEs?: string[];
}

export type ScanData = {
  target: string;
  ip: string;
  timestamp: string;
  isOnline: boolean;
  geoIp: GeoIpData | null;
  dns: DnsRecord[];
  whois: WhoisData | null;
  ports: PortScanResult[];
  technologies: Technology[];
  subdomains: string[];
  exposedServices: ExposedService[];
};

export type FullScanResult = {
  id: string;
  scanData: ScanData;
  aiAnalysis: AnalyzeScanResultsOutput;
};
