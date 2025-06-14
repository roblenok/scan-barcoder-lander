
import React, { useState, useRef, useEffect } from 'react';
import { Camera, History, Search, Globe, Trash2, Copy, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import BarcodeScanner from '@/components/BarcodeScanner';
import ScanHistory from '@/components/ScanHistory';
import { ScanResult } from '@/types/scan';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    // Load scan history from localStorage
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleScanResult = (result: string) => {
    console.log('Scan result:', result);
    const newScan: ScanResult = {
      id: Date.now().toString(),
      content: result,
      timestamp: new Date(),
      type: detectBarcodeType(result)
    };

    const updatedHistory = [newScan, ...scanHistory];
    setScanHistory(updatedHistory);
    localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
    
    setIsScanning(false);
    setActiveTab('history');
    
    toast({
      title: "Barcode Scanned Successfully!",
      description: `Found: ${result.substring(0, 50)}${result.length > 50 ? '...' : ''}`,
    });
  };

  const detectBarcodeType = (content: string): string => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return 'URL';
    } else if (content.includes('@') && content.includes('.')) {
      return 'Email';
    } else if (/^\+?[\d\s\-\(\)]+$/.test(content)) {
      return 'Phone';
    } else if (content.startsWith('WIFI:')) {
      return 'WiFi';
    } else if (content.includes('BEGIN:VCARD')) {
      return 'Contact';
    } else {
      return 'Text';
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('scanHistory');
    toast({
      title: "History Cleared",
      description: "All scan history has been deleted.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  const openInBrowser = (content: string) => {
    let url = content;
    if (!content.startsWith('http://') && !content.startsWith('https://')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(content)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan to Web</h1>
          <p className="text-gray-600">Fast barcode & QR code scanner</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History ({scanHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
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
                        Point your camera at a barcode or QR code to scan
                      </p>
                    </div>
                    <Button 
                      onClick={() => setIsScanning(true)} 
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
                      onResult={handleScanResult}
                      onError={(error) => {
                        console.error('Scanner error:', error);
                        toast({
                          title: "Scanner Error",
                          description: "Failed to access camera. Please check permissions.",
                          variant: "destructive"
                        });
                        setIsScanning(false);
                      }}
                    />
                    <Button 
                      onClick={() => setIsScanning(false)} 
                      variant="outline" 
                      className="w-full"
                    >
                      Stop Scanning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    QR Code
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    Code 128
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    EAN-13
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg">
                    <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                    Data Matrix
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Scan History</h2>
              {scanHistory.length > 0 && (
                <Button 
                  onClick={clearHistory} 
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
              onCopy={copyToClipboard}
              onOpenInBrowser={openInBrowser}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
