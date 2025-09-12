'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Dna,
  FileText,
  Globe,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Network,
  Layers,
  Fingerprint,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { FullScanResult } from '@/lib/types';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CveDetails } from './cve-details';

type DashboardProps = {
  data: FullScanResult;
};

const RiskBadge = ({ level }: { level: 'Low' | 'Medium' | 'High' }) => {
  const levelMap = {
    Low: {
      className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-500/20',
      icon: <ShieldCheck className="h-4 w-4" />,
      text: 'Low Risk'
    },
    Medium: {
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-500/20',
      icon: <AlertTriangle className="h-4 w-4" />,
      text: 'Medium Risk'
    },
    High: {
      className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-500/20',
      icon: <ShieldAlert className="h-4 w-4" />,
      text: 'High Risk'
    },
  };

  const { className, icon, text } = levelMap[level];

  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      {icon}
      {text}
    </Badge>
  );
};


const Summary = ({ data }: DashboardProps) => {
  const openPorts = data.scanData.ports.filter(p => p.status === 'open');

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Scan Summary
        </CardTitle>
        <CardDescription>{data.scanData.target}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-md">
                {data.scanData.isOnline ? (
                    <Signal className="h-5 w-5 text-green-600"/>
                ) : (
                    <Signal className="h-5 w-5 text-destructive"/>
                )}
            </div>
            <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <p className={cn("font-bold", data.scanData.isOnline ? "text-green-600" : "text-destructive")}>{data.scanData.isOnline ? "Online" : "Offline"}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">IP Address</span>
            <p className="font-mono">{data.scanData.ip}</p>
          </div>
        </div>
         <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Location</span>
          <span className="text-sm">{data.scanData.geoIp ? `${data.scanData.geoIp.city}, ${data.scanData.geoIp.country}`: 'N/A'}</span>
        </div>
        <Separator />
        <div className="space-y-3">
            <h4 className="text-sm font-medium">Open Ports ({openPorts.length})</h4>
            <div className="flex flex-wrap gap-2">
                {openPorts.length > 0 ? openPorts.map(p => (
                    <Badge key={p.port} variant="secondary" className="font-mono">{p.port}</Badge>
                )) : <p className="text-sm text-muted-foreground">None found</p>}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Details = ({ data }: DashboardProps) => {
  const hasDns = data.scanData.dns.length > 0;
  const hasWhois = !!data.scanData.whois;
  const hasSubdomains = data.scanData.subdomains.length > 0;
  const hasTech = data.scanData.technologies.length > 0;
  const hasExposedServices = data.scanData.exposedServices.length > 0;

  return (
    <Tabs defaultValue="report" className="w-full">
       <TabsList className="mb-4 h-auto flex-wrap justify-start">
        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2"/>Risk Report</TabsTrigger>
        <TabsTrigger value="ports"><HelpCircle className="w-4 h-4 mr-2"/>Port Scan</TabsTrigger>
        <TabsTrigger value="dns" disabled={!hasDns}><Dna className="w-4 h-4 mr-2"/>DNS</TabsTrigger>
        <TabsTrigger value="whois" disabled={!hasWhois}><Globe className="w-4 h-4 mr-2"/>WHOIS</TabsTrigger>
        <TabsTrigger value="subdomains" disabled={!hasSubdomains}><Network className="w-4 h-4 mr-2"/>Subdomains</TabsTrigger>
        <TabsTrigger value="tech" disabled={!hasTech}><Layers className="w-4 h-4 mr-2"/>Tech Stack</TabsTrigger>
        <TabsTrigger value="exposed" disabled={!hasExposedServices}><Fingerprint className="w-4 h-4 mr-2"/>Exposed</TabsTrigger>
      </TabsList>
      <TabsContent value="report">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Risk Analysis</CardTitle>
            <CardDescription>{data.aiAnalysis.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Finding</TableHead>
                  <TableHead className="w-[150px]">Risk Level</TableHead>
                  <TableHead>Suggested Remediation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.aiAnalysis.riskAssessments.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.finding}</TableCell>
                    <TableCell><RiskBadge level={item.riskLevel} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.remediation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ports">
        <Card>
          <CardHeader>
            <CardTitle>Port Scan Details</CardTitle>
            <CardDescription>Results of TCP connect scans on common ports.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="border rounded-lg overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Port</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Banner</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.scanData.ports.map((p) => (
                        <TableRow key={p.port}>
                            <TableCell className="font-mono">{p.port}/{p.protocol}</TableCell>
                            <TableCell>
                                <Badge variant={p.status === 'open' ? 'default' : p.status === 'closed' ? 'secondary' : 'outline'}
                                className={cn(
                                    p.status === 'open' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-500/20',
                                    p.status === 'closed' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-500/20',
                                    p.status === 'filtered' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-500/20',
                                )}>
                                    {p.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{p.service || 'N/A'}</TableCell>
                            <TableCell className="font-mono text-xs">{p.banner || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="dns">
        <Card>
          <CardHeader>
            <CardTitle>DNS Records</CardTitle>
            <CardDescription>Domain Name System records for {data.scanData.target}.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="border rounded-lg overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>TTL</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.scanData.dns.map((r, i) => (
                        <TableRow key={i}>
                            <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                            <TableCell className="font-mono text-xs max-w-xs truncate">{r.value}</TableCell>
                            <TableCell>{r.ttl}s</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="whois">
        <Card>
          <CardHeader>
            <CardTitle>WHOIS Information</CardTitle>
            <CardDescription>Public registration data for {data.scanData.target}.</CardDescription>
          </CardHeader>
          <CardContent className="border rounded-lg p-6">
            <div className="space-y-4 text-sm">
                <p><span className="font-medium text-muted-foreground w-32 inline-block">Registrar:</span> {data.scanData.whois?.registrar || 'N/A'}</p>
                <p><span className="font-medium text-muted-foreground w-32 inline-block">Creation Date:</span> {data.scanData.whois?.creationDate ? new Date(data.scanData.whois.creationDate).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium text-muted-foreground w-32 inline-block">Expiration Date:</span> {data.scanData.whois?.expirationDate ? new Date(data.scanData.whois.expirationDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <Separator className="my-6" />
            <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap bg-muted p-4 rounded-md">
                {data.scanData.whois?.raw}
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="subdomains">
        <Card>
            <CardHeader>
                <CardTitle>Discovered Subdomains</CardTitle>
                <CardDescription>Subdomains found during enumeration for {data.scanData.target}.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {data.scanData.subdomains.map(sub => (
                        <div key={sub} className="p-2 bg-accent rounded-md text-sm font-mono truncate">{sub}</div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="tech">
        <Card>
            <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
                <CardDescription>Technologies detected on {data.scanData.target}.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Version</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.scanData.technologies.map((tech) => (
                            <TableRow key={tech.name}>
                                <TableCell className="font-medium">{tech.name}</TableCell>
                                <TableCell><Badge variant="secondary">{tech.category}</Badge></TableCell>
                                <TableCell className="font-mono text-xs">{tech.version || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="exposed">
        <Card>
            <CardHeader>
                <CardTitle>Exposed Services</CardTitle>
                <CardDescription>Potentially vulnerable services discovered on the network.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Port</TableHead>
                            <TableHead>Service</TableHead>
                             <TableHead>Version</TableHead>
                            <TableHead>Potential CVE</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.scanData.exposedServices.map((service) => (
                            <TableRow key={service.port} className="[&_td]:text-destructive/80">
                                <TableCell>{service.port}</TableCell>
                                <TableCell>{service.service}</TableCell>
                                <TableCell className="font-mono text-xs">{service.version}</TableCell>
                                <TableCell>
                                {service.potentialCVE && (
                                  <CveDetails 
                                    cveId={service.potentialCVE} 
                                    allCves={service.allCVEs || []} 
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export function Dashboard({ data }: DashboardProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      // Add a small delay to ensure all content is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert the report to a canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Create a new PDF
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the content
      const imgWidth = pageWidth - 20; // Add margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`security-scan-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={handleDownloadPdf}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Report as PDF
        </Button>
      </div>
      
      <div ref={reportRef} className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Security Scan Report</h1>
          <p className="text-muted-foreground">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-y-6 lg:sticky lg:top-24">
            <Summary data={data} />
          </div>
          <div className="lg:col-span-2">
            <Details data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
