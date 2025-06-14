
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Endpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'CURL';
  enabled: boolean;
}

interface EndpointConfigProps {
  onSave: (endpoints: Endpoint[]) => void;
}

const EndpointConfig: React.FC<EndpointConfigProps> = ({ onSave }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);

  useEffect(() => {
    // Load from localStorage instead of database
    const saved = localStorage.getItem('customEndpoints');
    if (saved) {
      setEndpoints(JSON.parse(saved));
    } else {
      // Initialize with empty endpoints
      const defaultEndpoints: Endpoint[] = Array.from({ length: 6 }, (_, i) => ({
        id: `endpoint-${i + 1}`,
        name: `Endpoint ${i + 1}`,
        url: '',
        method: 'GET' as const,
        enabled: false
      }));
      setEndpoints(defaultEndpoints);
    }
  }, []);

  const saveEndpoints = (newEndpoints: Endpoint[]) => {
    setEndpoints(newEndpoints);
    localStorage.setItem('customEndpoints', JSON.stringify(newEndpoints));
    onSave(newEndpoints);
    toast({
      title: "Endpoints Saved",
      description: "Your custom endpoints have been saved successfully.",
    });
  };

  const updateEndpoint = (id: string, updates: Partial<Endpoint>) => {
    const newEndpoints = endpoints.map(ep => 
      ep.id === id ? { ...ep, ...updates } : ep
    );
    saveEndpoints(newEndpoints);
  };

  const testEndpoint = async (endpoint: Endpoint) => {
    if (!endpoint.url) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL for this endpoint.",
        variant: "destructive"
      });
      return;
    }

    // Test with sample data
    const testData = {
      upc: '123456789012',
      var: 'test_value',
      user: 'test_user'
    };

    try {
      let testUrl = endpoint.url;
      // Replace variables in URL
      testUrl = testUrl.replace(/\$upc/g, testData.upc);
      testUrl = testUrl.replace(/\$var/g, testData.var);
      testUrl = testUrl.replace(/\$user/g, testData.user);

      const options: RequestInit = {
        method: endpoint.method === 'CURL' ? 'POST' : endpoint.method,
        mode: 'no-cors' // Handle CORS for external endpoints
      };

      if (endpoint.method === 'POST' || endpoint.method === 'CURL') {
        options.headers = {
          'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(testData);
      }

      await fetch(testUrl, options);
      
      toast({
        title: "Test Successful",
        description: `Request sent to ${endpoint.name}. Check your LAMP server logs.`,
      });
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test request. Check the URL and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Custom Endpoints</h3>
        <p className="text-sm text-gray-600">Configure up to 6 endpoints for your LAMP stack</p>
      </div>

      <div className="grid gap-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id} className="border-0 shadow-md bg-white/90">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{endpoint.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Enabled</label>
                  <input
                    type="checkbox"
                    checked={endpoint.enabled}
                    onChange={(e) => updateEndpoint(endpoint.id, { enabled: e.target.checked })}
                    className="rounded"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor={`name-${endpoint.id}`}>Name</Label>
                <Input
                  id={`name-${endpoint.id}`}
                  value={endpoint.name}
                  onChange={(e) => updateEndpoint(endpoint.id, { name: e.target.value })}
                  placeholder="Endpoint name"
                />
              </div>

              <div>
                <Label htmlFor={`url-${endpoint.id}`}>URL</Label>
                <Input
                  id={`url-${endpoint.id}`}
                  value={endpoint.url}
                  onChange={(e) => updateEndpoint(endpoint.id, { url: e.target.value })}
                  placeholder="https://example.com/endpoint.php?upc=$upc&v=$var&user=$user"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variables: $upc, $var, $user
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`method-${endpoint.id}`}>Method</Label>
                  <Select
                    value={endpoint.method}
                    onValueChange={(value: 'GET' | 'POST' | 'CURL') => 
                      updateEndpoint(endpoint.id, { method: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="CURL">CURL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => testEndpoint(endpoint)}
                    variant="outline"
                    size="sm"
                    disabled={!endpoint.url}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-2">LAMP Stack Integration:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Variables: $upc (barcode), $var (custom value), $user (user identifier)</li>
          <li>GET: Variables in URL query string</li>
          <li>POST/CURL: Variables in JSON body</li>
          <li>Configure your PHP endpoints to handle these variables</li>
        </ul>
      </div>
    </div>
  );
};

export default EndpointConfig;
