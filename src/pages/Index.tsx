import React, { useState, useEffect, useRef } from 'react';
import { Camera, History, Settings, Globe, Trash2, Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useScanHistory } from '@/hooks/useScanHistory';
import BarcodeScanner from '@/components/BarcodeScanner';
import ScanHistory from '@/components/ScanHistory';
import EndpointConfig from '@/components/EndpointConfig';
import EndpointTrigger from '@/components/EndpointTrigger';
import AuthForm from '@/components/AuthForm';
import { type EncryptedEndpoint } from '@/utils/encryption';

interface Endpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'CURL';
  enabled: boolean;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { 
    scanHistory, 
    loading: historyLoading, 
    addScanResult, 
    clearHistory, 
    migrateLocalStorageData 
  } = useScanHistory();
  
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [endpoints, setEndpoints] = useState<EncryptedEndpoint[]>([]);
  const [currentBarcode, setCurrentBarcode] = useState<string>('');
  const hasMigratedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  console.log('Index render - loading:', loading, 'user:', user?.email);

  // Show loading state
  if (loading) {
    console.log('Index: showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    console.log('Index: no user, showing auth form');
    return <AuthForm />;
  }

  console.log('Index: user authenticated, showing main app');

  // Migrate localStorage data once when user is loaded
  useEffect(() => {
    if (user?.id && !hasMigratedRef.current && isMountedRef.current) {
      console.log('Index: starting localStorage migration');
      hasMigratedRef.current = true;
      // Use setTimeout to defer the migration to avoid blocking the render
      setTimeout(() => {
        if (isMountedRef.current) {
          migrateLocalStorageData();
        }
      }, 100);
    }
  }, [user?.id, migrateLocalStorageData]);

  const handleScanResult = async (result: string) => {
    if (!isMountedRef.current || !user) return;
    
    console.log('Scan result:', result);
    setCurrentBarcode(result);
    
    const detectedType = detectBarcodeType(result);
    await addScanResult(result, detectedType);
    
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

  const handleSignOut = async () => {
    if (!isMountedRef.current) return;
    
    try {
      await signOut();
      if (isMountedRef.current) {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header with user info and logout */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">LAMP Scanner</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
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
                  disabled={historyLoading}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {historyLoading ? (
              <Card className="border-0 shadow-md bg-white/90">
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading history...</p>
                </CardContent>
              </Card>
            ) : (
              <ScanHistory 
                history={scanHistory}
                onCopy={copyToClipboard}
                onOpenInBrowser={openInBrowser}
              />
            )}
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
