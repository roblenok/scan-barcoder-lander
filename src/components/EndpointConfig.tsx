
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, AlertTriangle, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { validateEndpointUrl } from '@/utils/urlValidation';
import { 
  saveEncryptedEndpoints, 
  loadEncryptedEndpoints, 
  clearEncryptedEndpoints,
  type EncryptedEndpoint 
} from '@/utils/encryption';

interface EndpointConfigProps {
  onSave: (endpoints: EncryptedEndpoint[]) => void;
}

const EndpointConfig: React.FC<EndpointConfigProps> = ({ onSave }) => {
  const [endpoints, setEndpoints] = useState<EncryptedEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = () => {
    setLoading(true);
    try {
      const loadedEndpoints = loadEncryptedEndpoints();
      setEndpoints(loadedEndpoints);
      onSave(loadedEndpoints);
      
      if (loadedEndpoints.length > 0) {
        toast({
          title: "Endpoints Loaded",
          description: `Loaded ${loadedEndpoints.length} encrypted endpoints from local storage.`,
        });
      }
    } catch (error) {
      console.error('Error loading endpoints:', error);
      toast({
        title: "Error Loading Endpoints",
        description: "Failed to load encrypted endpoints. They may be corrupted.",
        variant: "destructive"
      });
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

  const saveEndpoints = () => {
    try {
      saveEncryptedEndpoints(endpoints);
      onSave(endpoints);
      
      toast({
        title: "Endpoints Saved",
        description: "All endpoints have been encrypted and saved locally.",
      });
    } catch (error) {
      console.error('Error saving endpoints:', error);
      toast({
        title: "Error Saving Endpoints",
        description: "Failed to save encrypted endpoints.",
        variant: "destructive"
      });
    }
  };

  const deleteEndpoint = (id: string) => {
    const updatedEndpoints = endpoints.filter(ep => ep.id !== id);
    setEndpoints(updatedEndpoints);
    
    try {
      saveEncryptedEndpoints(updatedEndpoints);
      onSave(updatedEndpoints);
      
      toast({
        title: "Endpoint Deleted",
        description: "Endpoint has been removed and encryption updated.",
      });
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast({
        title: "Error",
        description: "Failed to delete endpoint.",
        variant: "destructive"
      });
    }
  };

  const addEndpoint = () => {
    const newEndpoint: EncryptedEndpoint = {
      id: `endpoint-${Date.now()}`,
      name: '',
      url: '',
      method: 'GET',
      enabled: true
    };
    setEndpoints([...endpoints, newEndpoint]);
  };

  const updateEndpoint = (id: string, updates: Partial<EncryptedEndpoint>) => {
    const updatedEndpoints = endpoints.map(ep => 
      ep.id === id ? { ...ep, ...updates } : ep
    );
    setEndpoints(updatedEndpoints);

    // Validate URL if it was updated
    if (updates.url !== undefined) {
      validateUrl(id, updates.url);
    }
  };

  const clearAllEndpoints = () => {
    try {
      clearEncryptedEndpoints();
      setEndpoints([]);
      onSave([]);
      
      toast({
        title: "All Endpoints Cleared",
        description: "All encrypted endpoint data has been removed.",
      });
    } catch (error) {
      console.error('Error clearing endpoints:', error);
      toast({
        title: "Error",
        description: "Failed to clear endpoints.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading encrypted endpoints...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          LAMP Endpoints
        </h2>
        <div className="flex gap-2">
          <Button onClick={addEndpoint} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
          <Button onClick={saveEndpoints} size="sm" variant="outline">
            Save All
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-md bg-green-50/90">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Encrypted Local Storage</p>
              <p className="text-green-700 mt-1">
                Your endpoints are encrypted and stored locally. No database required, works offline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              </CardContent>
            </Card>
          ))}
          
          {endpoints.length > 0 && (
            <Button 
              onClick={clearAllEndpoints} 
              variant="outline" 
              size="sm"
              className="w-full text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All Endpoints
            </Button>
          )}
        </div>
      )}

      <Card className="border-0 shadow-md bg-amber-50/90">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Security Notice</p>
              <p className="text-amber-700 mt-1">
                Endpoints are AES encrypted in localStorage. URLs are validated to prevent SSRF attacks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointConfig;
