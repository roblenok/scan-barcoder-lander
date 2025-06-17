
import React from 'react';
import { Zap } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <div className="text-center mb-6">
      <div className="flex justify-center items-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-gray-900">LAMP Scanner</h1>
          <p className="text-sm text-gray-600">Local Mode</p>
        </div>
      </div>
      <p className="text-gray-600">Your private barcode scanner with encrypted endpoints</p>
    </div>
  );
};

export default AppHeader;
