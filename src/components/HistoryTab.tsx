
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScanHistory from '@/components/ScanHistory';
import { type ScanResult } from '@/types/scan';

interface HistoryTabProps {
  scanHistory: ScanResult[];
  onClearHistory: () => void;
  onCopyToClipboard: (text: string) => void;
  onOpenInBrowser: (content: string) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  scanHistory,
  onClearHistory,
  onCopyToClipboard,
  onOpenInBrowser
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Scan History</h2>
        {scanHistory.length > 0 && (
          <Button 
            onClick={onClearHistory} 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <ScanHistory 
        history={scanHistory}
        onCopy={onCopyToClipboard}
        onOpenInBrowser={onOpenInBrowser}
      />
    </div>
  );
};

export default HistoryTab;
