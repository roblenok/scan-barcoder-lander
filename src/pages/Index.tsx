
import React, { useState, useRef } from 'react';
import { Camera, History, Settings, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import EndpointConfig from '@/components/EndpointConfig';
import AppHeader from '@/components/AppHeader';
import ScanTab from '@/components/ScanTab';
import EndpointsTab from '@/components/EndpointsTab';
import HistoryTab from '@/components/HistoryTab';
import { useEndpoints } from '@/hooks/useEndpoints';
import { useLocalScanHistory } from '@/hooks/useLocalScanHistory';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [currentBarcode, setCurrentBarcode] = useState<string>('');
  const isMountedRef = useRef(true);

  const { endpoints, endpointsLoaded, handleEndpointUpdate } = useEndpoints();
  const { scanHistory, addScanResult, clearHistory } = useLocalScanHistory();

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

  const handleScanResult = async (result: string) => {
    if (!isMountedRef.current) return;
    
    console.log('Index: Scan result received:', result);
    setCurrentBarcode(result);
    
    const detectedType = detectBarcodeType(result);
    addScanResult(result, detectedType);
    
    setIsScanning(false);
    setActiveTab('endpoints');
    
    toast({
      title: "Barcode Scanned Successfully!",
      description: `Found: ${result.substring(0, 50)}${result.length > 50 ? '...' : ''}`,
    });
    
    console.log('Index: Endpoints available for trigger:', endpoints.length);
  };

  const handleScanError = (error: any) => {
    console.error('Scanner error:', error);
    if (isMountedRef.current) {
      toast({
        title: "Scanner Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
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
        <AppHeader />

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
            <ScanTab
              isScanning={isScanning}
              isMountedRef={isMountedRef}
              onStartScanning={() => setIsScanning(true)}
              onStopScanning={() => setIsScanning(false)}
              onScanResult={handleScanResult}
              onScanError={handleScanError}
            />
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <EndpointsTab
              endpointsLoaded={endpointsLoaded}
              currentBarcode={currentBarcode}
              endpoints={endpoints}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <HistoryTab
              scanHistory={scanHistory}
              onClearHistory={clearHistory}
              onCopyToClipboard={copyToClipboard}
              onOpenInBrowser={openInBrowser}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <EndpointConfig onSave={handleEndpointUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
