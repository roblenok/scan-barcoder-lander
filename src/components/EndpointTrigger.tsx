
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Endpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'CURL';
  enabled: boolean;
}

interface EndpointTriggerProps {
  barcode: string;
  endpoints: Endpoint[];
}

const EndpointTrigger: React.FC<EndpointTriggerProps> = ({ barcode, endpoints }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const triggerEndpoint = async (endpoint: Endpoint) => {
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
    <Card className="border-0 shadow-md bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg">Send to LAMP Endpoints</CardTitle>
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
                {endpoint.name} ({endpoint.method})
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EndpointTrigger;
