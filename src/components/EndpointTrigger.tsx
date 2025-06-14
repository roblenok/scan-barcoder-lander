
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { type EncryptedEndpoint } from '@/utils/encryption';

interface EndpointTriggerProps {
  barcode: string;
  endpoints: EncryptedEndpoint[];
}

const EndpointTrigger: React.FC<EndpointTriggerProps> = ({ barcode, endpoints }) => {
  const [loading, setLoading] = useState<string | null>(null);

  // Auto-send to the first enabled endpoint when barcode changes
  useEffect(() => {
    const enabledEndpoint = endpoints.find(ep => ep.enabled && ep.url);
    if (barcode && enabledEndpoint) {
      triggerEndpoint(enabledEndpoint);
    }
  }, [barcode, endpoints]);

  const triggerEndpoint = async (endpoint: EncryptedEndpoint) => {
    if (!endpoint.url) return;

    setLoading(endpoint.id);

    try {
      const data = {
        upc: barcode,
        var: '',
        user: ''
      };

      let url = endpoint.url;
      // Replace variables in URL for GET requests
      if (endpoint.method === 'GET') {
        url = url.replace(/\$upc/g, encodeURIComponent(data.upc));
        url = url.replace(/\$var/g, encodeURIComponent(data.var));
        url = url.replace(/\$user/g, encodeURIComponent(data.user));
      }

      const options: RequestInit = {
        method: endpoint.method === 'CURL' ? 'POST' : endpoint.method,
        mode: 'no-cors' // Handle CORS for LAMP stack
      };

      // For POST and CURL, send data in body
      if (endpoint.method === 'POST' || endpoint.method === 'CURL') {
        options.headers = {
          'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(data);
      }

      console.log(`Triggering ${endpoint.name}:`, { url, method: endpoint.method, data });
      
      await fetch(url, options);
      
      // Open endpoint URL in new tab after successful submission
      window.open(url, '_blank');
      
      toast({
        title: "Request Sent",
        description: `Successfully sent data to ${endpoint.name}`,
      });
    } catch (error) {
      console.error(`Failed to trigger ${endpoint.name}:`, error);
      toast({
        title: "Request Failed",
        description: `Failed to send data to ${endpoint.name}`,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const enabledEndpoints = endpoints.filter(ep => ep.enabled && ep.url);

  if (enabledEndpoints.length === 0) {
    return (
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No enabled endpoints configured.</p>
          <p className="text-sm text-gray-400 mt-1">Configure endpoints in the settings tab.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md bg-white/90">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Send to LAMP Endpoints
          </CardTitle>
          <p className="text-sm text-gray-600">Barcode: {barcode}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="grid gap-2">
              {enabledEndpoints.map((endpoint) => (
                <Button
                  key={endpoint.id}
                  onClick={() => triggerEndpoint(endpoint)}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={loading !== null}
                >
                  {loading === endpoint.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send to {endpoint.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-green-50/90">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Secure & Local</p>
              <p className="text-green-700 mt-1">
                Your endpoints are encrypted locally. Requests sent with no-cors mode for LAMP compatibility.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointTrigger;
