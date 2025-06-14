
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.aeb0fe75f717421c8c87e71c94f4d9c1',
  appName: 'Scan to Web',
  webDir: 'dist',
  server: {
    url: 'https://aeb0fe75-f717-421c-8c87-e71c94f4d9c1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;
