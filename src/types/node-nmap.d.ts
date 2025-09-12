declare module 'node-nmap' {
  export interface NmapScanOptions {
    target: string;
    ports?: string;
    arguments?: string;
  }

  export interface NmapScanResult {
    hostname: string;
    ip: string;
    mac: string | null;
    openPorts: Array<{
      port: number;
      protocol: string;
      service: string;
      state: string;
      version: string;
    }>;
  }

  export class NmapScan {
    constructor(options: NmapScanOptions);
    scan(): Promise<NmapScanResult[]>;
  }

  export type NmapScanStatus = 'starting' | 'progress' | 'finished' | 'error';
}
