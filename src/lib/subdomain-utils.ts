import { resolve4, resolve6 } from 'node:dns/promises';

const COMMON_SUBDOMAINS = [
  'www', 'mail', 'smtp', 'pop', 'imap', 'webmail', 'dev', 'test', 'staging',
  'api', 'app', 'blog', 'shop', 'store', 'support', 'help', 'docs', 'wiki',
  'portal', 'admin', 'secure', 'vpn', 'ftp', 'sftp', 'git', 'm', 'mobile'
];

export async function enumerateSubdomains(domain: string): Promise<string[]> {
  const subdomains: string[] = [];
  
  // Check common subdomains
  const checks = COMMON_SUBDOMAINS.map(async (sub) => {
    const hostname = `${sub}.${domain}`;
    try {
      // Try both IPv4 and IPv6 lookups
      await Promise.any([
        resolve4(hostname),
        resolve6(hostname)
      ]);
      return hostname;
    } catch (e) {
      return null;
    }
  });

  // Wait for all checks to complete
  const results = await Promise.all(checks);
  
  // Filter out null results and add to subdomains
  for (const result of results) {
    if (result) {
      subdomains.push(result);
    }
  }

  return subdomains;
}
