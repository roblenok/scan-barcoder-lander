
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef } from 'react';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const useSupabase = () => {
  const [config, setConfig] = useState<SupabaseConfig | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('supabaseConfig');
    if (savedConfig && isMountedRef.current) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Failed to parse Supabase config:', error);
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateConfig = (url: string, anonKey: string) => {
    if (!isMountedRef.current) return;
    
    const newConfig = { url, anonKey };
    setConfig(newConfig);
    localStorage.setItem('supabaseConfig', JSON.stringify(newConfig));
    
    // Note: In a production app, you'd want to reinitialize the client here
    // For now, we'll use the static client
  };

  const clearConfig = () => {
    if (!isMountedRef.current) return;
    
    setConfig(null);
    localStorage.removeItem('supabaseConfig');
  };

  // Always return the static client to avoid multiple instances
  return {
    client: supabase,
    config,
    updateConfig,
    clearConfig,
    isConfigured: true // Always true since we have a static client
  };
};
