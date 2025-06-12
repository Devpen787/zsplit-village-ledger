
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { SyncStatus } from '@/adapters/sync/types';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSync?: number;
  conflictCount?: number;
  className?: string;
}

export const SyncStatusIndicator = ({ 
  status, 
  lastSync, 
  conflictCount = 0, 
  className = '' 
}: SyncStatusIndicatorProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          variant: 'default' as const,
          text: 'Synced',
          color: 'text-green-600'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          variant: 'secondary' as const,
          text: 'Syncing',
          color: 'text-blue-600'
        };
      case 'conflict':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          variant: 'destructive' as const,
          text: `${conflictCount} Conflicts`,
          color: 'text-red-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          variant: 'destructive' as const,
          text: 'Error',
          color: 'text-red-600'
        };
      case 'offline':
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          variant: 'outline' as const,
          text: 'Offline',
          color: 'text-gray-500'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const lastSyncText = lastSync 
    ? `Last sync: ${new Date(lastSync).toLocaleTimeString()}`
    : 'Never synced';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={statusInfo.variant} className={`gap-1 ${className}`}>
            {statusInfo.icon}
            <span className="text-xs">{statusInfo.text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className={`font-medium ${statusInfo.color}`}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            <div className="text-gray-600">{lastSyncText}</div>
            {conflictCount > 0 && (
              <div className="text-red-600">
                {conflictCount} conflict{conflictCount !== 1 ? 's' : ''} need resolution
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator;
