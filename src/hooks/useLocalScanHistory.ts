
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { type ScanResult } from '@/types/scan';

export const useLocalScanHistory = () => {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lamp_scanner_history');
      if (saved) {
        const parsedHistory = JSON.parse(saved);
        const formattedHistory = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setScanHistory(formattedHistory);
        console.log('useLocalScanHistory: Loaded scan history:', formattedHistory.length);
      }
    } catch (error) {
      console.error('useLocalScanHistory: Error loading scan history:', error);
    }
  }, []);

  const addScanResult = (content: string, type: string) => {
    const newScan: ScanResult = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date()
    };
    
    const updatedHistory = [newScan, ...scanHistory];
    setScanHistory(updatedHistory);
    
    const historyForStorage = updatedHistory.map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));
    localStorage.setItem('lamp_scanner_history', JSON.stringify(historyForStorage));
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('lamp_scanner_history');
    toast({
      title: "History Cleared",
      description: "All scan history has been removed.",
    });
  };

  return {
    scanHistory,
    addScanResult,
    clearHistory
  };
};
