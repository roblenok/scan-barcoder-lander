
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Database, Key, Save } from 'lucide-react';

interface SupabaseConfigProps {
  onConfigSave: (url: string, anonKey: string) => void;
  currentConfig?: { url: string; anonKey: string };
}

const SupabaseConfig: React.FC<SupabaseConfigProps> = ({ onConfigSave, currentConfig }) => {
  const [url, setUrl] = useState(currentConfig?.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig?.anonKey || '');

  const handleSave = () => {
    if (!url || !anonKey) {
      toast({
        title: "Missing Configuration",
        description: "Please provide both Supabase URL and Anonymous Key.",
        variant: "destructive"
      });
      return;
    }

    if (!url.includes('supabase.co')) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid Supabase project URL.",
        variant: "destructive"
      });
      return;
    }

    onConfigSave(url, anonKey);
    toast({
      title: "Configuration Saved",
      description: "Your Supabase configuration has been saved securely.",
    });
  };

  return (
    <Card className="border-0 shadow-md bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Your Supabase Configuration
        </CardTitle>
        <p className="text-sm text-gray-600">
          Connect to your own Supabase project to keep your data private and secure.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="supabase-url">Supabase Project URL</Label>
          <Input
            id="supabase-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="supabase-key">Anonymous Key</Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="supabase-key"
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="pl-10 font-mono text-sm"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-2">📋 Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a free Supabase account at supabase.com</li>
            <li>Create a new project</li>
            <li>Go to Settings → API</li>
            <li>Copy your Project URL and anon/public key</li>
            <li>Create a table called "user_endpoints" with RLS enabled</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConfig;
