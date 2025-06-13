
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  XCircle, 
  WifiOff,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'synced' | 'conflict' | 'error' | 'offline';
  lastSync?: number;
  conflictCount?: number;
  className?: string;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status,
  lastSync,
  conflictCount = 0,
  className
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: CheckCircle,
          text: 'Synced',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'syncing':
        return {
          icon: Loader2,
          text: 'Syncing',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClassName: 'animate-spin'
        };
      case 'conflict':
        return {
          icon: AlertTriangle,
          text: conflictCount > 0 ? `${conflictCount} Conflicts` : 'Conflict',
          variant: 'destructive' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'error':
        return {
          icon: XCircle,
          text: 'Error',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Offline',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Idle',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return null;
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const lastSyncText = formatLastSync(lastSync);

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon 
        className={cn(
          'h-3 w-3', 
          config.iconClassName
        )} 
      />
      <span>{config.text}</span>
      {lastSyncText && status === 'synced' && (
        <span className="opacity-75">• {lastSyncText}</span>
      )}
    </Badge>
  );
};

export default SyncStatusIndicator;
