
import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BarcodeScanner from '@/components/BarcodeScanner';

interface ScanTabProps {
  isScanning: boolean;
  isMountedRef: React.MutableRefObject<boolean>;
  onStartScanning: () => void;
  onStopScanning: () => void;
  onScanResult: (result: string) => void;
  onScanError: (error: any) => void;
}

const ScanTab: React.FC<ScanTabProps> = ({
  isScanning,
  isMountedRef,
  onStartScanning,
  onStopScanning,
  onScanResult,
  onScanError
}) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Camera className="w-5 h-5 text-blue-600" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isScanning ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-6">
                Scan barcodes to send to your secure endpoints
              </p>
            </div>
            <Button 
              onClick={() => isMountedRef.current && onStartScanning()} 
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <BarcodeScanner 
              onResult={onScanResult}
              onError={onScanError}
            />
            <Button 
              onClick={() => isMountedRef.current && onStopScanning()} 
              variant="outline" 
              className="w-full"
            >
              Stop Scanning
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanTab;
