
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
      const options: RequestInit = {
        method: endpoint.method
      };

      if (endpoint.method === 'GET') {
        // Replace variables in URL for GET requests
        url = url.replace(/\$upc/g, encodeURIComponent(data.upc));
        url = url.replace(/\$var/g, encodeURIComponent(data.var));
        url = url.replace(/\$user/g, encodeURIComponent(data.user));
        
        // Open GET requests in new tab
        window.open(url, '_blank');
      } else if (endpoint.method === 'POST') {
        // For POST, send data in body and don't open in browser
        options.headers = {
          'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(data);
        
        console.log(`Sending POST to ${endpoint.name}:`, { url, data });
        
        const response = await fetch(url, options);
        console.log('POST response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      }

      toast({
        title: "Request Sent",
        description: `Successfully sent ${endpoint.method} request to ${endpoint.name}`,
      });
    } catch (error) {
      console.error(`Failed to trigger ${endpoint.name}:`, error);
      toast({
        title: "Request Failed",
        description: `Failed to send ${endpoint.method} request to ${endpoint.name}`,
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
                  Send {endpoint.method} to {endpoint.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-blue-50/90">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Variables Available</p>
              <p className="text-blue-700 mt-1">
                <strong>GET:</strong> Use $upc, $var, $user in URL<br/>
                <strong>POST:</strong> JSON body with upc, var, user fields
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointTrigger;
