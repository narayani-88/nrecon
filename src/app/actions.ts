'use server';

import { analyzeScanResults, AnalyzeScanResultsInput } from '@/ai/flows/risk-assessment-and-reporting';
import { DnsRecord, FullScanResult, GeoIpData, PortScanResult, ScanData, WhoisData, Technology, ExposedService } from '@/lib/types';
import { z } from 'zod';
import { scanPorts } from '@/lib/port-scanner';
import { lookupDns, isDomainReachable } from '@/lib/dns-utils';
import { lookupWhois } from '@/lib/whois-utils';
import { enumerateSubdomains } from '@/lib/subdomain-utils';

const targetSchema = z.string().min(1, 'Target cannot be empty.');

// Common ports to scan
const COMMON_PORTS = [21, 22, 25, 80, 110, 143, 443, 3306, 3389, 5432, 8080];
/**
 * Checks for common CVEs based on service and version
 * @param service The service name (e.g., 'nginx', 'openssl')
 * @param version The version string of the service
 * @returns Array of CVE IDs
 */
async function checkForCVEs(service: string, version: string, banner?: string): Promise<string[]> {
  try {
    // Clean up the service name and version
    const serviceLower = service.toLowerCase().split(' ')[0];
    const versionMatch = version.match(/(\d+(\.\d+)+([-.]\w+)*)/);
    const cleanVersion = versionMatch ? versionMatch[1] : version;
    
    console.log(`Checking CVEs for service: ${serviceLower}, version: ${cleanVersion}, banner: ${banner}`);
    
    // More dynamic CVE checking based on actual service detection
    const cveMap: Record<string, Record<string, string[]>> = {
      'nginx': {
        '1.18.0': ['CVE-2021-23017', 'CVE-2020-12440'],
        '1.16.0': ['CVE-2019-20372', 'CVE-2020-12440'],
        '1.14.0': ['CVE-2018-16843', 'CVE-2018-16844', 'CVE-2018-16845'],
        '1.20.0': ['CVE-2022-41741', 'CVE-2022-41742'],
        '1.20.1': ['CVE-2022-41741', 'CVE-2022-41742'],
        '1.21.0': ['CVE-2023-44487'],
        '1.21.6': ['CVE-2023-44487', 'CVE-2023-38408']
      },
      'apache': {
        '2.4.46': ['CVE-2020-11984', 'CVE-2020-11993', 'CVE-2020-9490'],
        '2.4.41': ['CVE-2019-9517', 'CVE-2019-10098', 'CVE-2019-10097'],
        '2.4.49': ['CVE-2021-41773', 'CVE-2021-42013'],
        '2.4.50': ['CVE-2022-22719', 'CVE-2022-22720'],
        '2.4.52': ['CVE-2022-31813', 'CVE-2022-30522']
      },
      'openssh': {
        '8.2p1': ['CVE-2020-15778', 'CVE-2020-14145'],
        '7.9p1': ['CVE-2019-6111', 'CVE-2019-6110', 'CVE-2019-6109'],
        '8.9p1': ['CVE-2021-41617'],
        '9.0p1': ['CVE-2023-38408'],
        '8.0p1': ['CVE-2020-14145', 'CVE-2019-16905']
      },
      'ssh': {
        '8.2p1': ['CVE-2020-15778', 'CVE-2020-14145'],
        '7.9p1': ['CVE-2019-6111', 'CVE-2019-6110', 'CVE-2019-6109']
      },
      'mysql': {
        '8.0.22': ['CVE-2021-21695', 'CVE-2021-21696', 'CVE-2021-21697'],
        '5.7.33': ['CVE-2021-2032', 'CVE-2021-2026', 'CVE-2021-2019'],
        '8.0.28': ['CVE-2022-21245', 'CVE-2022-21270'],
        '8.0.32': ['CVE-2023-21980', 'CVE-2023-21977']
      },
      'mariadb': {
        '10.3.34': ['CVE-2021-46669', 'CVE-2022-27376'],
        '10.5.15': ['CVE-2022-27376', 'CVE-2022-27377'],
        '10.6.7': ['CVE-2022-27376', 'CVE-2022-27385']
      },
      'vsftpd': {
        '3.0.3': ['CVE-2021-3618'],
        '2.3.4': ['CVE-2011-2523']
      },
      'proftpd': {
        '1.3.6': ['CVE-2019-12815', 'CVE-2020-9272'],
        '1.3.7': ['CVE-2021-46854']
      },
      'openssl': {
        '1.1.1f': ['CVE-2021-3449', 'CVE-2021-3450', 'CVE-2021-23840'],
        '1.1.1': ['CVE-2020-1971', 'CVE-2020-1968', 'CVE-2020-1967'],
        '3.0.0': ['CVE-2022-2068', 'CVE-2022-2097'],
        '3.0.7': ['CVE-2023-0286', 'CVE-2023-0215']
      },
      'http': {
        'unknown': ['CVE-2023-44487'] // HTTP/2 Rapid Reset
      },
      'https': {
        'unknown': ['CVE-2023-44487', 'CVE-2022-3602'] // TLS/SSL related
      }
    };

    // Try to extract more specific service info from banner
    let detectedService = serviceLower;
    let detectedVersion = cleanVersion;
    
    if (banner) {
      const bannerLower = banner.toLowerCase();
      
      // Check for specific services in banner
      if (bannerLower.includes('nginx')) {
        detectedService = 'nginx';
        const nginxVersion = banner.match(/nginx\/(\d+\.\d+\.\d+)/i);
        if (nginxVersion) detectedVersion = nginxVersion[1];
      } else if (bannerLower.includes('apache')) {
        detectedService = 'apache';
        const apacheVersion = banner.match(/apache\/(\d+\.\d+\.\d+)/i);
        if (apacheVersion) detectedVersion = apacheVersion[1];
      } else if (bannerLower.includes('openssh')) {
        detectedService = 'openssh';
        const sshVersion = banner.match(/openssh[_\s](\d+\.\d+p?\d*)/i);
        if (sshVersion) detectedVersion = sshVersion[1];
      } else if (bannerLower.includes('mysql')) {
        detectedService = 'mysql';
        const mysqlVersion = banner.match(/(\d+\.\d+\.\d+)/);
        if (mysqlVersion) detectedVersion = mysqlVersion[1];
      }
    }
    
    // Find matching vulnerabilities
    const serviceKey = Object.keys(cveMap).find(key => 
      detectedService.includes(key.toLowerCase()) || key.toLowerCase().includes(detectedService)
    );
    
    if (serviceKey && cveMap[serviceKey][detectedVersion]) {
      console.log(`Found CVEs for ${serviceKey} ${detectedVersion}:`, cveMap[serviceKey][detectedVersion]);
      return cveMap[serviceKey][detectedVersion];
    }
    
    // Check for generic service-based CVEs
    if (serviceKey && cveMap[serviceKey]['unknown']) {
      console.log(`Found generic CVEs for ${serviceKey}:`, cveMap[serviceKey]['unknown']);
      return cveMap[serviceKey]['unknown'];
    }
    
    console.log(`No CVEs found for ${detectedService} ${detectedVersion}`);
    return [];
  } catch (error) {
    console.error('Error checking for CVEs:', error);
    return [];
  }
}

/**
 * Gets GeoIP information for an IP address
 * @param ip The IP address to look up
 * @returns GeoIP data or null if lookup fails
 */
async function getGeoIp(ip: string): Promise<GeoIpData | null> {
  try {
    console.log(`Looking up GeoIP for: ${ip}`);
    
    // Handle local/private IPs
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: 'Local Network',
        region: 'Private',
        city: 'Local',
        lat: 0,
        lon: 0
      };
    }
    
    // Try multiple GeoIP APIs for better reliability
    const apis = [
      {
        url: `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`,
        parser: (data: any) => ({
          country: data.country || 'Unknown',
          region: data.regionName || 'Unknown', 
          city: data.city || 'Unknown',
          lat: data.lat || 0,
          lon: data.lon || 0
        })
      },
      {
        url: `https://ipapi.co/${ip}/json/`,
        parser: (data: any) => ({
          country: data.country_name || 'Unknown',
          region: data.region || 'Unknown',
          city: data.city || 'Unknown', 
          lat: data.latitude || 0,
          lon: data.longitude || 0
        })
      },
      {
        url: `https://ipinfo.io/${ip}/json`,
        parser: (data: any) => {
          const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
          return {
            country: data.country || 'Unknown',
            region: data.region || 'Unknown',
            city: data.city || 'Unknown',
            lat: lat || 0,
            lon: lon || 0
          };
        }
      }
    ];
    
    for (const api of apis) {
      try {
        console.log(`Trying GeoIP API: ${api.url}`);
        const response = await fetch(api.url, {
          headers: {
            'User-Agent': 'Nrecon-Scanner/1.0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`GeoIP API response:`, data);
          
          if (data && (data.status !== 'fail' || !data.status)) {
            const result = api.parser(data);
            console.log(`GeoIP result:`, result);
            return result;
          }
        }
      } catch (apiError) {
        console.error(`GeoIP API ${api.url} failed:`, apiError);
        continue;
      }
    }
    
    // If all APIs fail, return unknown location
    console.warn('All GeoIP APIs failed, returning unknown location');
    return {
      country: 'Unknown',
      region: 'Unknown', 
      city: 'Unknown',
      lat: 0,
      lon: 0
    };
  } catch (error) {
    console.error('GeoIP lookup failed:', error);
    return null;
  }
}

/**
 * Detects technologies based on port number and banner information
 * @param ip The IP address being scanned
 * @param port The port number to check
 * @returns Array of detected technologies
 */
async function detectTechnologies(ip: string, port: number, banner?: string): Promise<Technology[]> {
  const technologies: Technology[] = [];
  
  console.log(`Detecting technologies for port ${port} with banner: ${banner}`);
  
  // Analyze banner first for accurate detection
  if (banner) {
    const bannerLower = banner.toLowerCase();
    
    // Web servers
    if (bannerLower.includes('nginx')) {
      const version = banner.match(/nginx\/(\d+\.\d+\.\d+)/i)?.[1] || null;
      technologies.push({ name: 'Nginx', category: 'Web Server', version });
      technologies.push({ name: 'HTTP', category: 'Protocol', version: '1.1' });
    } else if (bannerLower.includes('apache')) {
      const version = banner.match(/apache\/(\d+\.\d+\.\d+)/i)?.[1] || null;
      technologies.push({ name: 'Apache HTTP Server', category: 'Web Server', version });
      technologies.push({ name: 'HTTP', category: 'Protocol', version: '1.1' });
    } else if (bannerLower.includes('iis')) {
      const version = banner.match(/iis\/(\d+\.\d+)/i)?.[1] || null;
      technologies.push({ name: 'Microsoft IIS', category: 'Web Server', version });
      technologies.push({ name: 'HTTP', category: 'Protocol', version: '1.1' });
    }
    
    // SSH
    if (bannerLower.includes('openssh')) {
      const version = banner.match(/openssh[_\s](\d+\.\d+p?\d*)/i)?.[1] || null;
      technologies.push({ name: 'OpenSSH', category: 'Protocol', version });
    }
    
    // Databases
    if (bannerLower.includes('mysql')) {
      const version = banner.match(/(\d+\.\d+\.\d+)/)?.[1] || null;
      technologies.push({ name: 'MySQL', category: 'Database', version });
    } else if (bannerLower.includes('postgresql') || bannerLower.includes('postgres')) {
      const version = banner.match(/(\d+\.\d+)/)?.[1] || null;
      technologies.push({ name: 'PostgreSQL', category: 'Database', version });
    } else if (bannerLower.includes('mongodb')) {
      const version = banner.match(/(\d+\.\d+\.\d+)/)?.[1] || null;
      technologies.push({ name: 'MongoDB', category: 'Database', version });
    }
    
    // Operating Systems
    if (bannerLower.includes('ubuntu')) {
      const version = banner.match(/ubuntu[^\d]*(\d+\.\d+)/i)?.[1] || null;
      technologies.push({ name: 'Ubuntu', category: 'Backend', version });
    } else if (bannerLower.includes('centos')) {
      const version = banner.match(/centos[^\d]*(\d+)/i)?.[1] || null;
      technologies.push({ name: 'CentOS', category: 'Backend', version });
    } else if (bannerLower.includes('debian')) {
      const version = banner.match(/debian[^\d]*(\d+)/i)?.[1] || null;
      technologies.push({ name: 'Debian', category: 'Backend', version });
    } else if (bannerLower.includes('windows')) {
      technologies.push({ name: 'Windows Server', category: 'Backend', version: null });
    }
    
    // Programming languages/frameworks
    if (bannerLower.includes('php')) {
      const version = banner.match(/php\/(\d+\.\d+\.\d+)/i)?.[1] || null;
      technologies.push({ name: 'PHP', category: 'Backend', version });
    } else if (bannerLower.includes('node.js') || bannerLower.includes('nodejs')) {
      const version = banner.match(/node\.?js[^\d]*(\d+\.\d+)/i)?.[1] || null;
      technologies.push({ name: 'Node.js', category: 'Backend', version });
    } else if (bannerLower.includes('python')) {
      const version = banner.match(/python[^\d]*(\d+\.\d+)/i)?.[1] || null;
      technologies.push({ name: 'Python', category: 'Backend', version });
    }
    
    // SSL/TLS
    if (bannerLower.includes('openssl')) {
      const version = banner.match(/openssl\/(\d+\.\d+\.\d+[a-z]*)/i)?.[1] || null;
      technologies.push({ name: 'OpenSSL', category: 'Security', version });
    }
    
    // If we found technologies from banner, return them
    if (technologies.length > 0) {
      console.log(`Found technologies from banner:`, technologies);
      return technologies;
    }
  }
  
  // Fallback to port-based detection with more realistic assumptions
  const portMappings: Record<number, Technology[]> = {
    21: [{ name: 'FTP', category: 'Protocol', version: null }],
    22: [{ name: 'SSH', category: 'Protocol', version: null }],
    23: [{ name: 'Telnet', category: 'Protocol', version: null }],
    25: [{ name: 'SMTP', category: 'Protocol', version: null }],
    53: [{ name: 'DNS', category: 'Protocol', version: null }],
    80: [{ name: 'HTTP', category: 'Protocol', version: '1.1' }],
    110: [{ name: 'POP3', category: 'Protocol', version: null }],
    143: [{ name: 'IMAP', category: 'Protocol', version: null }],
    389: [{ name: 'LDAP', category: 'Protocol', version: null }],
    443: [
      { name: 'HTTPS', category: 'Protocol', version: '1.1' },
      { name: 'TLS', category: 'Security', version: null }
    ],
    445: [{ name: 'SMB', category: 'Protocol', version: null }],
    993: [
      { name: 'IMAPS', category: 'Protocol', version: null },
      { name: 'TLS', category: 'Security', version: null }
    ],
    995: [
      { name: 'POP3S', category: 'Protocol', version: null },
      { name: 'TLS', category: 'Security', version: null }
    ],
    1433: [{ name: 'Microsoft SQL Server', category: 'Database', version: null }],
    1521: [{ name: 'Oracle Database', category: 'Database', version: null }],
    2049: [{ name: 'NFS', category: 'Protocol', version: null }],
    3306: [{ name: 'MySQL', category: 'Database', version: null }],
    3389: [{ name: 'RDP', category: 'Protocol', version: null }],
    5432: [{ name: 'PostgreSQL', category: 'Database', version: null }],
    5900: [{ name: 'VNC', category: 'Protocol', version: null }],
    5985: [{ name: 'WinRM', category: 'Protocol', version: null }],
    5986: [
      { name: 'WinRM', category: 'Protocol', version: null },
      { name: 'TLS', category: 'Security', version: null }
    ],
    6379: [{ name: 'Redis', category: 'Database', version: null }],
    8000: [{ name: 'HTTP', category: 'Protocol', version: '1.1' }],
    8080: [{ name: 'HTTP', category: 'Protocol', version: '1.1' }],
    8443: [
      { name: 'HTTPS', category: 'Protocol', version: '1.1' },
      { name: 'TLS', category: 'Security', version: null }
    ],
    9200: [{ name: 'Elasticsearch', category: 'Search', version: null }],
    27017: [{ name: 'MongoDB', category: 'Database', version: null }]
  };
  
  // Add technologies based on port number only if no banner analysis was done
  if (portMappings[port]) {
    technologies.push(...portMappings[port]);
  }
  
  console.log(`Final technologies detected for port ${port}:`, technologies);
  return technologies;
}

/**
 * Identifies exposed services from open ports and checks for known vulnerabilities
 * @param openPorts Array of open port scan results
 * @returns Array of exposed services with vulnerability information
 */
async function getExposedServices(openPorts: PortScanResult[]): Promise<ExposedService[]> {
  const exposedServices: ExposedService[] = [];
  
  // Common services and their default ports
  const commonServices: Record<number, string> = {
    21: 'ftp',
    22: 'ssh',
    23: 'telnet',
    25: 'smtp',
    53: 'dns',
    80: 'http',
    110: 'pop3',
    143: 'imap',
    389: 'ldap',
    443: 'https',
    445: 'smb',
    993: 'imaps',
    995: 'pop3s',
    1433: 'mssql',
    1521: 'oracle',
    2049: 'nfs',
    3306: 'mysql',
    3389: 'rdp',
    5432: 'postgresql',
    5900: 'vnc',
    5985: 'winrm',
    5986: 'winrm-ssl',
    6379: 'redis',
    7001: 'weblogic',
    8000: 'http-alt',
    8009: 'ajp',
    8080: 'http-proxy',
    8081: 'http-proxy',
    8443: 'https-alt',
    9000: 'jenkins',
    9090: 'websocket',
    9200: 'elasticsearch',
    11211: 'memcached',
    27017: 'mongodb',
  };
  
  for (const port of openPorts) {
    if (port.status !== 'open') continue;
    
    try {
      // Determine service name from port number if not provided
      let serviceName = port.service?.toLowerCase() || commonServices[port.port] || 'unknown';
      
      // Clean up service name (remove version numbers, etc.)
      serviceName = serviceName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      // Extract version from banner if available
      let version = 'unknown';
      if (port.banner) {
        const versionMatch = port.banner.match(/(\d+(\.\d+)+([-.]\w+)*)/);
        if (versionMatch) {
          version = versionMatch[0];
        }
      }
      
      // Check for CVEs with banner information
      const cves = await checkForCVEs(serviceName, version, port.banner);
      
      // Add the exposed service
      exposedServices.push({
        port: port.port,
        service: serviceName,
        version,
        potentialCVE: cves[0],
        allCVEs: cves,
        banner: port.banner || undefined
      });
      
    } catch (error) {
      console.error(`Error processing port ${port.port}:`, error);
      // Continue with next port
      continue;
    }
  }
  
  // Sort by port number
  return exposedServices.sort((a, b) => a.port - b.port);
}

export async function performScan(
  target: string
): Promise<{ success: true; data: FullScanResult } | { success: false; error: string }> {
  try {
    // Validate the target input
    const validatedTarget = targetSchema.parse(target);
    
    // 1. Check if domain is reachable
    const isOnline = await isDomainReachable(validatedTarget);
    if (!isOnline) {
      return { 
        success: false, 
        error: 'Target is not reachable. Please check the domain or IP address and try again.' 
      };
    }
    
    // 2. Perform DNS lookup
    let dns: DnsRecord[] = [];
    try {
      dns = await lookupDns(validatedTarget);
    } catch (error) {
      console.error('DNS lookup failed:', error);
      // Continue with empty DNS results
    }
    
    // 3. Get IP address from DNS or use the target if it's an IP
    const ip = dns.find(r => r.type === 'A')?.value || 
              (validatedTarget.match(/^\d{1,3}(\.\d{1,3}){3}$/) ? validatedTarget : '');
    
    if (!ip) {
      return { 
        success: false, 
        error: 'Could not resolve target to an IP address. Please check the domain or IP address and try again.' 
      };
    }
    
    // 4. Get GeoIP information
    const geoIp = await getGeoIp(ip);
    
    // 5. Perform port scan on the IP
    let ports: PortScanResult[] = [];
    try {
      ports = await scanPorts(ip);
    } catch (error) {
      console.error('Port scan failed:', error);
      return { 
        success: false, 
        error: 'Port scanning failed. Please make sure nmap is installed and try again.' 
      };
    }
    
    const openPorts = ports.filter(p => p.status === 'open');
    
    // 6. Get WHOIS information (only for domains, not IPs)
    let whois: WhoisData | null = null;
    if (!validatedTarget.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
      try {
        whois = await lookupWhois(validatedTarget);
      } catch (error) {
        console.error('WHOIS lookup failed:', error);
        // Continue without WHOIS data
      }
    }
    
    // 7. Enumerate subdomains (only for domains, not IPs)
    let subdomains: string[] = [];
    if (!validatedTarget.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
      try {
        subdomains = await enumerateSubdomains(validatedTarget);
      } catch (error) {
        console.error('Subdomain enumeration failed:', error);
        // Continue without subdomain data
      }
    }
    
    // 8. Detect technologies based on open ports and banners
    const technologies: Technology[] = [];
    for (const port of openPorts) {
      try {
        const tech = await detectTechnologies(ip, port.port, port.banner);
        technologies.push(...tech);
      } catch (error) {
        console.error(`Failed to detect technologies for port ${port.port}:`, error);
      }
    }
    
    // 9. Get exposed services with CVE information
    let exposedServices: ExposedService[] = [];
    try {
      exposedServices = await getExposedServices(openPorts);
    } catch (error) {
      console.error('Failed to get exposed services:', error);
      // Continue without exposed services data
    }
    
    // 10. Prepare the scan data
    const scanData: ScanData = {
      target: validatedTarget,
      ip,
      timestamp: new Date().toISOString(),
      isOnline: true, // If we got this far, the target is reachable
      ports,
      dns,
      whois,
      geoIp,
      technologies: Array.from(new Set(technologies)), // Remove duplicates
      subdomains,
      exposedServices,
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


    // 3. Call AI Analysis with fallback
    let aiAnalysis;
    try {
      console.log('Calling AI analysis with input:', JSON.stringify(aiInput, null, 2));
      console.log('Environment check - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
      
      aiAnalysis = await analyzeScanResults(aiInput);
      console.log('AI Analysis completed successfully:', aiAnalysis);
    } catch (aiError) {
      console.error('AI Analysis failed, using fallback:', aiError);
      console.error('Error details:', {
        message: aiError instanceof Error ? aiError.message : 'Unknown error',
        stack: aiError instanceof Error ? aiError.stack : 'No stack trace',
        name: aiError instanceof Error ? aiError.name : 'Unknown error type'
      });
      
      // Fallback AI analysis if the service fails
      aiAnalysis = {
        riskAssessments: aiInput.scanResults.map(result => ({
          finding: result.description,
          riskLevel: result.severity,
          remediation: `Consider reviewing and securing ${result.description.toLowerCase()}`
        })),
        summary: `Scan completed with ${aiInput.scanResults.length} findings. AI analysis is temporarily unavailable - using basic risk assessment. Please review the scan results manually for detailed security analysis.`
      };
    }

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
