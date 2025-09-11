'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import type { FullScanResult } from '@/lib/types';
import { History, ServerCrash } from 'lucide-react';
import { Badge } from './ui/badge';

type ScanHistoryProps = {
  history: FullScanResult[];
  onSelect: (id: string) => void;
};

export function ScanHistory({ history, onSelect }: ScanHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-2 bg-muted rounded-md"><History className="w-6 h-6 text-muted-foreground" /></div>
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
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {history.map(scan => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-semibold">{scan.scanData.target}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(scan.scanData.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                    {scan.aiAnalysis.riskAssessments.some(r => r.riskLevel === 'High') ? (
                        <Badge variant="destructive">High Risk</Badge>
                    ) : scan.aiAnalysis.riskAssessments.some(r => r.riskLevel === 'Medium') ? (
                        <Badge variant="default">Medium Risk</Badge>
                    ) : (
                        <Badge variant="secondary">Low Risk</Badge>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => onSelect(scan.id)}>
                        View
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
