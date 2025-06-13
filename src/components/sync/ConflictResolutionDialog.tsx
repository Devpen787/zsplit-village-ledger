
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, User, Clock } from 'lucide-react';
import { SyncConflict } from '@/adapters/sync/types';

interface ConflictResolutionDialogProps {
  conflict: SyncConflict | null;
  onResolve: (conflictId: string, resolution: 'local' | 'remote') => void;
  onClose: () => void;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  conflict,
  onResolve,
  onClose
}) => {
  if (!conflict) return null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getConflictDescription = () => {
    switch (conflict.type) {
      case 'expense':
        return 'This expense has been modified by multiple users simultaneously.';
      case 'group':
        return 'This group has been modified by multiple users simultaneously.';
      case 'user':
        return 'This user profile has been modified simultaneously.';
      default:
        return 'A conflict has been detected in the data.';
    }
  };

  const renderVersionComparison = () => {
    const local = conflict.localVersion;
    const remote = conflict.remoteVersion;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Version
              <Badge variant="outline" className="text-xs">Local</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflict.conflictFields.map(field => (
              <div key={`local-${field}`} className="flex justify-between">
                <span className="text-sm font-medium capitalize">{field}:</span>
                <span className="text-sm text-gray-600">
                  {String(local[field] || 'N/A')}
                </span>
              </div>
            ))}
            {local.last_modified && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Clock className="h-3 w-3" />
                Modified: {formatTimestamp(new Date(local.last_modified).getTime())}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Other Version
              <Badge variant="outline" className="text-xs">Remote</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflict.conflictFields.map(field => (
              <div key={`remote-${field}`} className="flex justify-between">
                <span className="text-sm font-medium capitalize">{field}:</span>
                <span className="text-sm text-gray-600">
                  {String(remote[field] || 'N/A')}
                </span>
              </div>
            ))}
            {remote.last_modified && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Clock className="h-3 w-3" />
                Modified: {formatTimestamp(new Date(remote.last_modified).getTime())}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={!!conflict} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Sync Conflict Detected
          </DialogTitle>
          <DialogDescription>
            {getConflictDescription()} Please choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderVersionComparison()}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onResolve(conflict.id, 'local')}
          >
            Keep My Version
          </Button>
          <Button
            variant="outline"
            onClick={() => onResolve(conflict.id, 'remote')}
          >
            Keep Other Version
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
