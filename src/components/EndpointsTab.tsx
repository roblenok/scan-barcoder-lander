
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import EndpointTrigger from '@/components/EndpointTrigger';
import { type EncryptedEndpoint } from '@/utils/encryption';

interface EndpointsTabProps {
  endpointsLoaded: boolean;
  currentBarcode: string;
  endpoints: EncryptedEndpoint[];
}

const EndpointsTab: React.FC<EndpointsTabProps> = ({
  endpointsLoaded,
  currentBarcode,
  endpoints
}) => {
  if (!endpointsLoaded) {
    return (
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading endpoints...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentBarcode) {
    return (
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No barcode scanned yet.</p>
          <p className="text-sm text-gray-400 mt-1">Scan a barcode first to send to endpoints.</p>
        </CardContent>
      </Card>
    );
  }

  return <EndpointTrigger barcode={currentBarcode} endpoints={endpoints} />;
};

export default EndpointsTab;
