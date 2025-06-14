
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Globe, Mail, Phone, Wifi, User, FileText } from 'lucide-react';
import { ScanResult } from '@/types/scan';

interface ScanHistoryProps {
  history: ScanResult[];
  onCopy: (content: string) => void;
  onOpenInBrowser: (content: string) => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ history, onCopy, onOpenInBrowser }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URL':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-green-600" />;
      case 'Phone':
        return <Phone className="w-4 h-4 text-purple-600" />;
      case 'WiFi':
        return <Wifi className="w-4 h-4 text-indigo-600" />;
      case 'Contact':
        return <User className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URL':
        return 'bg-blue-100 text-blue-800';
      case 'Email':
        return 'bg-green-100 text-green-800';
      case 'Phone':
        return 'bg-purple-100 text-purple-800';
      case 'WiFi':
        return 'bg-indigo-100 text-indigo-800';
      case 'Contact':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatContent = (content: string) => {
    if (content.length > 100) {
      return content.substring(0, 100) + '...';
    }
    return content;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (history.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-center">No scans yet</p>
          <p className="text-gray-400 text-sm text-center mt-1">
            Your scan history will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((scan) => (
        <Card key={scan.id} className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(scan.type)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(scan.type)}`}>
                  {scan.type}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(scan.timestamp)}
              </span>
            </div>
            
            <p className="text-gray-900 mb-3 font-mono text-sm break-all">
              {formatContent(scan.content)}
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={() => onCopy(scan.content)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                onClick={() => onOpenInBrowser(scan.content)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ScanHistory;
