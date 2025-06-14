
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScanResult } from '@/types/scan';
import { toast } from '@/hooks/use-toast';

export const useScanHistory = () => {
  const { user } = useAuth();
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize the loadScanHistory function to prevent infinite loops
  const loadScanHistory = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) {
      console.log('loadScanHistory: skipping - no user or unmounted');
      return;
    }
    
    console.log('loadScanHistory: starting for user', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading scan history:', error);
        toast({
          title: "Error Loading History",
          description: "Failed to load your scan history.",
          variant: "destructive"
        });
        return;
      }

      if (isMountedRef.current) {
        const formattedHistory = data.map(item => ({
          id: item.id,
          content: item.content,
          type: item.type,
          timestamp: new Date(item.timestamp || item.created_at)
        }));
        setScanHistory(formattedHistory);
        console.log('loadScanHistory: loaded', formattedHistory.length, 'items');
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  // Load scan history from database - only once when user.id becomes available
  useEffect(() => {
    if (user?.id && isMountedRef.current && !hasLoadedRef.current) {
      console.log('useEffect: loading scan history for first time');
      hasLoadedRef.current = true;
      loadScanHistory();
    } else if (!user?.id) {
      hasLoadedRef.current = false;
    }
  }, [user?.id, loadScanHistory]);

  // Memoize the migrateLocalStorageData function
  const migrateLocalStorageData = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) {
      console.log('migrateLocalStorageData: skipping - no user or unmounted');
      return;
    }

    const savedHistory = localStorage.getItem(`scanHistory_${user.id}`);
    if (!savedHistory) {
      console.log('migrateLocalStorageData: no localStorage data to migrate');
      return;
    }

    try {
      const parsedHistory = JSON.parse(savedHistory);
      if (!Array.isArray(parsedHistory) || parsedHistory.length === 0) return;

      console.log('Migrating localStorage scan history to database...');
      
      const dataToInsert = parsedHistory.map(item => ({
        user_id: user.id,
        content: item.content,
        type: item.type,
        timestamp: new Date(item.timestamp).toISOString()
      }));

      const { error } = await supabase
        .from('scan_history')
        .insert(dataToInsert);

      if (error) {
        console.error('Error migrating data:', error);
        return;
      }

      // Remove localStorage data after successful migration
      localStorage.removeItem(`scanHistory_${user.id}`);
      
      // Reload data from database
      hasLoadedRef.current = false;
      await loadScanHistory();
      
      toast({
        title: "Data Migrated",
        description: "Your scan history has been securely migrated to the database.",
      });
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  }, [user?.id, loadScanHistory]);

  const addScanResult = useCallback(async (result: string, type: string) => {
    if (!user?.id || !isMountedRef.current) return;

    console.log('addScanResult: adding new scan result');
    const newScan: ScanResult = {
      id: Date.now().toString(), // Temporary ID for optimistic update
      content: result,
      timestamp: new Date(),
      type
    };

    // Optimistic update
    setScanHistory(prev => [newScan, ...prev]);

    try {
      const { data, error } = await supabase
        .from('scan_history')
        .insert({
          user_id: user.id,
          content: result,
          type,
          timestamp: newScan.timestamp.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving scan result:', error);
        // Revert optimistic update
        setScanHistory(prev => prev.filter(scan => scan.id !== newScan.id));
        toast({
          title: "Error Saving Scan",
          description: "Failed to save scan result.",
          variant: "destructive"
        });
        return;
      }

      // Update with real ID from database
      if (isMountedRef.current && data) {
        setScanHistory(prev => prev.map(scan => 
          scan.id === newScan.id 
            ? { ...scan, id: data.id }
            : scan
        ));
      }
    } catch (error) {
      console.error('Error saving scan result:', error);
      // Revert optimistic update
      setScanHistory(prev => prev.filter(scan => scan.id !== newScan.id));
    }
  }, [user?.id]);

  const clearHistory = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) return;

    try {
      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing history:', error);
        toast({
          title: "Error",
          description: "Failed to clear scan history.",
          variant: "destructive"
        });
        return;
      }

      if (isMountedRef.current) {
        setScanHistory([]);
        toast({
          title: "History Cleared",
          description: "All scan history has been deleted.",
        });
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, [user?.id]);

  const refreshHistory = useCallback(() => {
    hasLoadedRef.current = false;
    loadScanHistory();
  }, [loadScanHistory]);

  return {
    scanHistory,
    loading,
    addScanResult,
    clearHistory,
    migrateLocalStorageData,
    refreshHistory
  };
};
