
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { type EncryptedEndpoint, loadEncryptedEndpoints } from '@/utils/encryption';

export const useEndpoints = () => {
  const [endpoints, setEndpoints] = useState<EncryptedEndpoint[]>([]);
  const [endpointsLoaded, setEndpointsLoaded] = useState(false);

  useEffect(() => {
    console.log('useEndpoints: Loading initial endpoints');
    
    try {
      const loadedEndpoints = loadEncryptedEndpoints();
      console.log('useEndpoints: Loaded endpoints:', loadedEndpoints.length);
      setEndpoints(loadedEndpoints);
      setEndpointsLoaded(true);
      
      if (loadedEndpoints.length > 0) {
        console.log('useEndpoints: Endpoints configured successfully');
      } else {
        console.log('useEndpoints: No endpoints configured yet');
      }
    } catch (error) {
      console.error('useEndpoints: Error loading endpoints:', error);
      toast({
        title: "Error Loading Endpoints",
        description: "Failed to load encrypted endpoints. Check settings tab.",
        variant: "destructive"
      });
      setEndpointsLoaded(true);
    }
  }, []);

  const handleEndpointUpdate = (updatedEndpoints: EncryptedEndpoint[]) => {
    console.log('useEndpoints: Endpoints updated from config:', updatedEndpoints.length);
    setEndpoints(updatedEndpoints);
    setEndpointsLoaded(true);
  };

  return {
    endpoints,
    endpointsLoaded,
    handleEndpointUpdate
  };
};
