
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const useSupabase = () => {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [config, setConfig] = useState<SupabaseConfig | null>(null);

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('supabaseConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      
      try {
        const supabaseClient = createClient(parsedConfig.url, parsedConfig.anonKey);
        setClient(supabaseClient);
      } catch (error) {
        console.error('Failed to create Supabase client:', error);
      }
    }
  }, []);

  const updateConfig = (url: string, anonKey: string) => {
    const newConfig = { url, anonKey };
    setConfig(newConfig);
    localStorage.setItem('supabaseConfig', JSON.stringify(newConfig));
    
    try {
      const supabaseClient = createClient(url, anonKey);
      setClient(supabaseClient);
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
    }
  };

  const clearConfig = () => {
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
