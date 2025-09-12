import dns from 'dns/promises';
import { DnsRecord } from '@/lib/types';

export async function lookupDns(domain: string): Promise<DnsRecord[]> {
  const records: DnsRecord[] = [];
  
  try {
    // Lookup A records (IPv4)
    try {
      const addresses = await dns.resolve4(domain);
      for (const address of addresses) {
        records.push({
          type: 'A',
          value: address,
          ttl: 300 // Default TTL in seconds
        });
      }
    } catch (e) {
      // Ignore if no A records found
    }

    // Lookup AAAA records (IPv6)
    try {
      const addresses = await dns.resolve6(domain);
      for (const address of addresses) {
        records.push({
          type: 'AAAA',
          value: address,
          ttl: 300
        });
      }
    } catch (e) {
      // Ignore if no AAAA records found
    }

    // Lookup MX records
    try {
      const mxRecords = await dns.resolveMx(domain);
      for (const mx of mxRecords) {
        records.push({
          type: 'MX',
          value: `${mx.priority} ${mx.exchange}`,
          ttl: 300
        });
      }
    } catch (e) {
      // Ignore if no MX records found
    }

    // Lookup TXT records
    try {
      const txtRecords = await dns.resolveTxt(domain);
      for (const txt of txtRecords) {
        records.push({
          type: 'TXT',
          value: txt.join(''),
          ttl: 300
        });
      }
    } catch (e) {
      // Ignore if no TXT records found
    }

    // Lookup NS records
    try {
      const nsRecords = await dns.resolveNs(domain);
      for (const ns of nsRecords) {
        records.push({
          type: 'NS',
          value: ns,
          ttl: 86400 // Longer TTL for NS records
        });
      }
    } catch (e) {
      // Ignore if no NS records found
    }

    // Lookup CNAME
    try {
      const cname = await dns.resolveCname(domain);
      if (cname && cname.length > 0) {
        records.push({
          type: 'CNAME',
          value: cname[0],
          ttl: 300
        });
      }
    } catch (e) {
      // Ignore if no CNAME record found
    }

    return records;
  } catch (error) {
    console.error('DNS lookup failed:', error);
    throw new Error('Failed to perform DNS lookup');
  }
}

export async function isDomainReachable(domain: string): Promise<boolean> {
  try {
    // Try to resolve the domain
    await dns.lookup(domain);
    return true;
  } catch (error) {
    return false;
  }
}
