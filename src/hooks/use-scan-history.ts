'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FullScanResult } from '@/lib/types';

const HISTORY_KEY = 'recon-lab-scan-history';
const MAX_HISTORY_ITEMS = 10;

export function useScanHistory() {
  const [history, setHistory] = useState<FullScanResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(HISTORY_KEY);
      if (item) {
        setHistory(JSON.parse(item));
      }
    } catch (error) {
      console.error('Failed to load scan history from localStorage', error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const addScanToHistory = useCallback((scanResult: FullScanResult) => {
    if (!isLoaded) return;
    try {
      setHistory(prevHistory => {
        const newHistory = [scanResult, ...prevHistory.filter(h => h.id !== scanResult.id)].slice(0, MAX_HISTORY_ITEMS);
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error('Failed to save scan history to localStorage', error);
    }
  }, [isLoaded]);

  const getScanById = useCallback((id: string) => {
    return history.find(scan => scan.id === id) || null;
  }, [history]);

  return { history, addScanToHistory, getScanById, isLoaded };
}
