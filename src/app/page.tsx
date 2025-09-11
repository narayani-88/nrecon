'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, ScanLine } from 'lucide-react';
import { ScanForm } from '@/components/scan-form';
import { Dashboard } from '@/components/dashboard';
import { performScan } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { FullScanResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScanHistory } from '@/components/scan-history';
import { useScanHistory } from '@/hooks/use-scan-history';

type View = 'form' | 'dashboard';

export default function Home() {
  const [view, setView] = useState<View>('form');
  const [scanResult, setScanResult] = useState<FullScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { history, addScanToHistory, getScanById, clearHistory } = useScanHistory();

  const handleScan = async (data: { target: string }) => {
    setIsLoading(true);
    setScanResult(null);

    const result = await performScan(data.target);

    if (result.success) {
      addScanToHistory(result.data);
      setScanResult(result.data);
      setView('dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  const handleHistorySelect = (id: string) => {
    const historicalScan = getScanById(id);
    if (historicalScan) {
      setScanResult(historicalScan);
      setView('dashboard');
    }
  };
  
  const handleClearHistory = () => {
    clearHistory();
    toast({
        title: 'History Cleared',
        description: 'Your scan history has been removed.',
    });
  }

  const renderContent = () => {
    if (view === 'dashboard' && scanResult) {
      return <Dashboard data={scanResult} />;
    }

    return (
      <div className="w-full max-w-lg mx-auto">
        <ScanForm onSubmit={handleScan} isLoading={isLoading} />
        <div className="mt-12">
          <ScanHistory history={history} onSelect={handleHistorySelect} onClear={handleClearHistory} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-primary">
              <ScanLine className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Nrecon</h1>
          </div>
          {view === 'dashboard' && (
            <Button variant="outline" size="sm" onClick={() => setView('form')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Scan
            </Button>
          )}
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {isLoading && view === 'form' ? (
          <div className="flex flex-col items-center justify-center text-center h-full max-w-md mx-auto py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-semibold tracking-tight">Scanning in Progress...</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Please wait while we perform reconnaissance. This might take a few moments.
            </p>
          </div>
        ) : (
          renderContent()
        )}
      </main>
      <footer className="p-4 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nrecon. For educational and authorized use only.</p>
        </div>
      </footer>
    </div>
  );
}
