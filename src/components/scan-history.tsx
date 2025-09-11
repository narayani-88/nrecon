'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import type { FullScanResult } from '@/lib/types';
import { History, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


const RiskIcon = ({ level }: { level: 'Low' | 'Medium' | 'High' }) => {
    if (level === 'High') return <ShieldAlert className="h-4 w-4 text-red-500" />;
    if (level === 'Medium') return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <ShieldCheck className="h-4 w-4 text-green-500" />;
}

type ScanHistoryProps = {
  history: FullScanResult[];
  onSelect: (id: string) => void;
};

export function ScanHistory({ history, onSelect }: ScanHistoryProps) {
  
  const getOverallRisk = (scan: FullScanResult): 'Low' | 'Medium' | 'High' => {
     if (scan.aiAnalysis.riskAssessments.some(r => r.riskLevel === 'High')) return 'High';
     if (scan.aiAnalysis.riskAssessments.some(r => r.riskLevel === 'Medium')) return 'Medium';
     return 'Low';
  }

  if (history.length === 0) {
    return (
      <Card className="border-dashed bg-accent/50">
        <CardHeader className="flex-row items-center gap-4 p-4">
            <div className="p-3 bg-background rounded-lg border">
                <History className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Your past scans will appear here.</CardDescription>
            </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan History</CardTitle>
        <CardDescription>Review your recent scans.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-2">
            {history.map(scan => {
              const risk = getOverallRisk(scan);
              return (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent cursor-pointer"
                onClick={() => onSelect(scan.id)}
              >
                <div className="flex items-center gap-3">
                   <RiskIcon level={risk} />
                   <div>
                    <p className="font-semibold">{scan.scanData.target}</p>
                    <p className="text-sm text-muted-foreground">
                        {new Date(scan.scanData.timestamp).toLocaleString()}
                    </p>
                   </div>
                </div>
                <div className='flex items-center gap-3'>
                    <Badge variant="outline" className={cn(
                        risk === 'High' && 'text-red-500 border-red-500/20',
                        risk === 'Medium' && 'text-amber-500 border-amber-500/20',
                        risk === 'Low' && 'text-green-500 border-green-500/20'
                    )}>
                        {risk} Risk
                    </Badge>
                    <Button variant="ghost" size="sm" >
                        View
                    </Button>
                </div>
              </div>
            )})}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
