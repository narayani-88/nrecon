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
  CheckCircle,
  Dna,
  FileText,
  Globe,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Signal,
} from 'lucide-react';
import type { FullScanResult, PortScanResult } from '@/lib/types';
import { Separator } from './ui/separator';

type DashboardProps = {
  data: FullScanResult;
};

const RiskBadge = ({ level }: { level: 'Low' | 'Medium' | 'High' }) => {
  const levelMap = {
    Low: {
      variant: 'secondary' as const,
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      text: 'Low Risk'
    },
    Medium: {
      variant: 'default' as const,
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      text: 'Medium Risk'
    },
    High: {
      variant: 'destructive' as const,
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
      text: 'High Risk'
    },
  };

  const { variant, icon, text } = levelMap[level];

  return <Badge variant={variant} className="flex-shrink-0 gap-1.5 pl-1.5 pr-2.5"><span className="p-0.5 bg-background/20 rounded-full">{icon}</span> {text}</Badge>;
};

const Summary = ({ data }: DashboardProps) => {
  const openPorts = data.scanData.ports.filter(p => p.status === 'open');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Summary</CardTitle>
        <CardDescription>{data.scanData.target}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {data.scanData.isOnline ? (
            <Badge variant="outline" className="text-green-600 border-green-600/50 gap-1.5"><Signal className="h-3 w-3"/>Online</Badge>
          ) : (
            <Badge variant="destructive">Offline</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">IP Address</span>
          <span className="text-sm font-mono">{data.scanData.ip}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Location</span>
          <span className="text-sm">{data.scanData.geoIp ? `${data.scanData.geoIp.city}, ${data.scanData.geoIp.country}`: 'N/A'}</span>
        </div>
        <Separator />
        <div className="space-y-2">
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
  const openPorts = data.scanData.ports.filter(p => p.status === 'open');
  const hasDns = data.scanData.dns.length > 0;
  const hasWhois = !!data.scanData.whois;

  return (
    <Tabs defaultValue="report">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="report"><FileText className="w-4 h-4 mr-2"/>Risk Report</TabsTrigger>
        <TabsTrigger value="ports"><HelpCircle className="w-4 h-4 mr-2"/>Port Scan</TabsTrigger>
        <TabsTrigger value="dns" disabled={!hasDns}><Dna className="w-4 h-4 mr-2"/>DNS</TabsTrigger>
        <TabsTrigger value="whois" disabled={!hasWhois}><Globe className="w-4 h-4 mr-2"/>WHOIS</TabsTrigger>
      </TabsList>
      <TabsContent value="report">
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Risk Analysis</CardTitle>
            <CardDescription>{data.aiAnalysis.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Finding</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Remediation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.aiAnalysis.riskAssessments.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.finding}</TableCell>
                    <TableCell><RiskBadge level={item.riskLevel} /></TableCell>
                    <TableCell>{item.remediation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                                <Badge variant={p.status === 'open' ? 'default' : p.status === 'closed' ? 'secondary' : 'outline'}>{p.status}</Badge>
                            </TableCell>
                            <TableCell>{p.service || 'N/A'}</TableCell>
                            <TableCell className="font-mono text-xs">{p.banner || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="whois">
        <Card>
          <CardHeader>
            <CardTitle>WHOIS Information</CardTitle>
            <CardDescription>Public registration data for {data.scanData.target}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
                <p><span className="font-medium text-muted-foreground">Registrar:</span> {data.scanData.whois?.registrar}</p>
                <p><span className="font-medium text-muted-foreground">Creation Date:</span> {data.scanData.whois?.creationDate ? new Date(data.scanData.whois.creationDate).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-medium text-muted-foreground">Expiration Date:</span> {data.scanData.whois?.expirationDate ? new Date(data.scanData.whois.expirationDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                {data.scanData.whois?.raw}
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export function Dashboard({ data }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
      <div className="lg:col-span-1 space-y-6">
        <Summary data={data} />
      </div>
      <div className="lg:col-span-2">
        <Details data={data} />
      </div>
    </div>
  );
}
