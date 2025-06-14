import React, { useState, useEffect, useRef } from 'react';
import { Camera, History, Settings, Globe, Trash2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import BarcodeScanner from '@/components/BarcodeScanner';
import ScanHistory from '@/components/ScanHistory';
import EndpointConfig from '@/components/EndpointConfig';
import EndpointTrigger from '@/components/EndpointTrigger';
import { type EncryptedEndpoint } from '@/utils/encryption';
import { type ScanResult } from '@/types/scan';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [endpoints, setEndpoints] = useState<EncryptedEndpoint[]>([]);
  const [currentBarcode, setCurrentBarcode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Load scan history from localStorage
    const saved = localStorage.getItem('lamp_scanner_history');
    if (saved) {
      try {
        const parsedHistory = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const formattedHistory = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setScanHistory(formattedHistory);
      } catch (error) {
        console.error('Error loading scan history:', error);
      }
    }

    return () => {
      isMountedRef.current = false;
    };
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
    
    // Save to localStorage (convert Date to string for storage)
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

  const handleScanResult = async (result: string) => {
    if (!isMountedRef.current) return;
    
    console.log('Scan result:', result);
    setCurrentBarcode(result);
    
    const detectedType = detectBarcodeType(result);
    addScanResult(result, detectedType);
    
    setIsScanning(false);
    setActiveTab('endpoints');
    
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
          <div className="flex justify-center items-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">LAMP Scanner</h1>
              <p className="text-sm text-gray-600">Local Mode</p>
            </div>
          </div>
          <p className="text-gray-600">Your private barcode scanner with encrypted endpoints</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="scan" className="flex items-center gap-1">
              <Camera className="w-4 h-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Config
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
                        Scan barcodes to send to your secure endpoints
                      </p>
                    </div>
                    <Button 
                      onClick={() => isMountedRef.current && setIsScanning(true)} 
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
                        if (isMountedRef.current) {
                          toast({
                            title: "Scanner Error",
                            description: "Failed to access camera. Please check permissions.",
                            variant: "destructive"
                          });
                          setIsScanning(false);
                        }
                      }}
                    />
                    <Button 
                      onClick={() => isMountedRef.current && setIsScanning(false)} 
                      variant="outline" 
                      className="w-full"
                    >
                      Stop Scanning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            {currentBarcode ? (
              <EndpointTrigger barcode={currentBarcode} endpoints={endpoints} />
            ) : (
              <Card className="border-0 shadow-md bg-white/90">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No barcode scanned yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Scan a barcode first to send to endpoints.</p>
                </CardContent>
              </Card>
            )}
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

          <TabsContent value="settings" className="space-y-4">
            <EndpointConfig onSave={setEndpoints} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
