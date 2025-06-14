
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateEndpointUrl } from '@/utils/urlValidation';

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
  const { user } = useAuth();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadEndpoints();
    }
  }, [user]);

  const loadEndpoints = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_endpoints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading endpoints:', error);
        toast({
          title: "Error Loading Endpoints",
          description: "Failed to load your endpoints.",
          variant: "destructive"
        });
        return;
      }

      const formattedEndpoints = data.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        method: item.method as 'GET' | 'POST' | 'CURL',
        enabled: item.enabled || false
      }));

      setEndpoints(formattedEndpoints);
      onSave(formattedEndpoints);
    } catch (error) {
      console.error('Error loading endpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (id: string, url: string) => {
    const validation = validateEndpointUrl(url);
    setUrlErrors(prev => ({
      ...prev,
      [id]: validation.isValid ? '' : (validation.error || 'Invalid URL')
    }));
    return validation.isValid;
  };

  const saveEndpoint = async (endpoint: Endpoint) => {
    if (!user) return;

    // Validate URL before saving
    if (!validateUrl(endpoint.id, endpoint.url)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_endpoints')
        .upsert({
          id: endpoint.id === `temp-${Date.now()}` ? undefined : endpoint.id,
          user_id: user.id,
          name: endpoint.name,
          url: endpoint.url,
          method: endpoint.method,
          enabled: endpoint.enabled
        });

      if (error) {
        console.error('Error saving endpoint:', error);
        toast({
          title: "Error Saving Endpoint",
          description: "Failed to save endpoint configuration.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Endpoint Saved",
        description: "Endpoint configuration has been saved.",
      });

      // Reload endpoints to get proper IDs
      await loadEndpoints();
    } catch (error) {
      console.error('Error saving endpoint:', error);
    }
  };

  const deleteEndpoint = async (id: string) => {
    if (!user) return;

    if (id.startsWith('temp-')) {
      // Remove temp endpoint from local state
      const updatedEndpoints = endpoints.filter(ep => ep.id !== id);
      setEndpoints(updatedEndpoints);
      onSave(updatedEndpoints);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_endpoints')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting endpoint:', error);
        toast({
          title: "Error Deleting Endpoint",
          description: "Failed to delete endpoint.",
          variant: "destructive"
        });
        return;
      }

      const updatedEndpoints = endpoints.filter(ep => ep.id !== id);
      setEndpoints(updatedEndpoints);
      onSave(updatedEndpoints);
      
      toast({
        title: "Endpoint Deleted",
        description: "Endpoint has been removed.",
      });
    } catch (error) {
      console.error('Error deleting endpoint:', error);
    }
  };

  const addEndpoint = () => {
    const newEndpoint: Endpoint = {
      id: `temp-${Date.now()}`,
      name: '',
      url: '',
      method: 'GET',
      enabled: true
    };
    setEndpoints([...endpoints, newEndpoint]);
  };

  const updateEndpoint = (id: string, updates: Partial<Endpoint>) => {
    const updatedEndpoints = endpoints.map(ep => 
      ep.id === id ? { ...ep, ...updates } : ep
    );
    setEndpoints(updatedEndpoints);
    onSave(updatedEndpoints);

    // Validate URL if it was updated
    if (updates.url !== undefined) {
      validateUrl(id, updates.url);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading endpoints...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">LAMP Endpoints</h2>
        <Button onClick={addEndpoint} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Endpoint
        </Button>
      </div>

      {endpoints.length === 0 ? (
        <Card className="border-0 shadow-md bg-white/90">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No endpoints configured.</p>
            <p className="text-sm text-gray-400 mt-1">Add an endpoint to send barcode data to your LAMP stack.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className="border-0 shadow-md bg-white/90">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={endpoint.enabled}
                      onCheckedChange={(enabled) => updateEndpoint(endpoint.id, { enabled })}
                    />
                    <span className="text-sm font-medium">
                      {endpoint.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <Button
                    onClick={() => deleteEndpoint(endpoint.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label htmlFor={`name-${endpoint.id}`}>Name</Label>
                    <Input
                      id={`name-${endpoint.id}`}
                      value={endpoint.name}
                      onChange={(e) => updateEndpoint(endpoint.id, { name: e.target.value })}
                      placeholder="My LAMP Server"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`url-${endpoint.id}`}>URL</Label>
                    <Input
                      id={`url-${endpoint.id}`}
                      value={endpoint.url}
                      onChange={(e) => updateEndpoint(endpoint.id, { url: e.target.value })}
                      placeholder="https://your-lamp-server.com/api/scan"
                      className={urlErrors[endpoint.id] ? 'border-red-500' : ''}
                    />
                    {urlErrors[endpoint.id] && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        {urlErrors[endpoint.id]}
                      </div>
                    )}
                  </div>

                  <div>
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
                </div>

                <Button
                  onClick={() => saveEndpoint(endpoint)}
                  className="w-full"
                  disabled={!endpoint.name || !endpoint.url || !!urlErrors[endpoint.id]}
                >
                  Save Endpoint
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-0 shadow-md bg-amber-50/90">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Security Notice</p>
              <p className="text-amber-700 mt-1">
                URLs are validated for security. Private IPs and localhost are blocked to prevent SSRF attacks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointConfig;
