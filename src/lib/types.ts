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

export type ScanData = {
  target: string;
  ip: string;
  timestamp: string;
  isOnline: boolean;
  geoIp: GeoIpData | null;
  dns: DnsRecord[];
  whois: WhoisData | null;
  ports: PortScanResult[];
};

export type FullScanResult = {
  id: string;
  scanData: ScanData;
  aiAnalysis: AnalyzeScanResultsOutput;
};
