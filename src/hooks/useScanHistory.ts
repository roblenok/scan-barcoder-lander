
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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize the loadScanHistory function to prevent infinite loops
  const loadScanHistory = useCallback(async () => {
    if (!user || !isMountedRef.current) return;
    
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
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  // Memoize the migrateLocalStorageData function
  const migrateLocalStorageData = useCallback(async () => {
    if (!user || !isMountedRef.current) return;

    const savedHistory = localStorage.getItem(`scanHistory_${user.id}`);
    if (!savedHistory) return;

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
      await loadScanHistory();
      
      toast({
        title: "Data Migrated",
        description: "Your scan history has been securely migrated to the database.",
      });
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  }, [user?.id, loadScanHistory]); // Properly depend on memoized loadScanHistory

  // Load scan history from database - only when user.id changes
  useEffect(() => {
    if (user?.id && isMountedRef.current) {
      loadScanHistory();
    }
  }, [user?.id, loadScanHistory]); // Depend on user.id and memoized loadScanHistory

  const addScanResult = useCallback(async (result: string, type: string) => {
    if (!user || !isMountedRef.current) return;

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
  }, [user?.id]); // Only depend on user.id

  const clearHistory = useCallback(async () => {
    if (!user || !isMountedRef.current) return;

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
  }, [user?.id]); // Only depend on user.id

  return {
    scanHistory,
    loading,
    addScanResult,
    clearHistory,
    migrateLocalStorageData,
    refreshHistory: loadScanHistory
  };
};
