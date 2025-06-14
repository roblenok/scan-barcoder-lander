
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useState, useEffect, useRef } from 'react';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const useSupabase = () => {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [config, setConfig] = useState<SupabaseConfig | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('supabaseConfig');
    if (savedConfig && isMountedRef.current) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        
        const supabaseClient = createClient(parsedConfig.url, parsedConfig.anonKey);
        if (isMountedRef.current) {
          setClient(supabaseClient);
        }
      } catch (error) {
        console.error('Failed to create Supabase client:', error);
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
    
    try {
      const supabaseClient = createClient(url, anonKey);
      if (isMountedRef.current) {
        setClient(supabaseClient);
      }
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
    }
  };

  const clearConfig = () => {
    if (!isMountedRef.current) return;
    
    setConfig(null);
    setClient(null);
    localStorage.removeItem('supabaseConfig');
  };

  return {
    client,
    config,
    updateConfig,
    clearConfig,
    isConfigured: !!client
  };
};
