
import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarcodeScannerProps {
  onResult: (result: string) => void;
  onError: (error: Error) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onResult, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const startScanning = async () => {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        console.log('Starting barcode scanner...');

        await reader.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current!,
          (result, error) => {
            if (result) {
              console.log('Barcode detected:', result.getText());
              onResult(result.getText());
            }
            if (error && !(error.name === 'NotFoundException')) {
              console.error('Scanner error:', error);
            }
          }
        );
      } catch (error) {
        console.error('Failed to start scanner:', error);
        onError(error as Error);
      }
    };

    startScanning();

    return () => {
      if (readerRef.current) {
        try {
          readerRef.current.reset();
        } catch (error) {
          console.log('Error resetting scanner:', error);
        }
      }
    };
  }, [onResult, onError]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-64 object-cover rounded-lg bg-black"
        playsInline
        muted
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-50"></div>
      </div>
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
        Point camera at barcode
      </div>
    </div>
  );
};

export default BarcodeScanner;
