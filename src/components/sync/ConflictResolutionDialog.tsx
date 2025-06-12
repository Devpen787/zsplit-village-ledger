
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
import { ConflictData } from '@/adapters/sync/types';
import { AlertTriangle, Clock, User } from 'lucide-react';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: ConflictData | null;
  onResolve: (conflictId: string, strategy: 'local' | 'remote' | 'merge') => void;
}

const ConflictResolutionDialog = ({
  isOpen,
  onClose,
  conflict,
  onResolve
}: ConflictResolutionDialogProps) => {
  if (!conflict) return null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderVersionData = (version: any, title: string, icon: React.ReactNode) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-gray-600">
          <div>Version: {version.version}</div>
          <div>Node: {version.nodeId}</div>
          <div>Modified: {formatTimestamp(version.timestamp)}</div>
        </div>
        <div className="text-sm">
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(version, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Resolve Data Conflict
          </DialogTitle>
          <DialogDescription>
            A conflict was detected between local and remote versions of the data.
            Choose how to resolve this conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              {conflict.conflictType.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-600">
              Conflict ID: {conflict.id}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {renderVersionData(
              conflict.localVersion,
              'Local Version',
              <User className="h-4 w-4" />
            )}
            {renderVersionData(
              conflict.remoteVersion,
              'Remote Version',
              <Clock className="h-4 w-4" />
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Resolution Strategies:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>Keep Local:</strong> Use your local version and discard remote changes</li>
              <li><strong>Use Remote:</strong> Accept the remote version and discard local changes</li>
              <li><strong>Merge:</strong> Attempt to combine both versions intelligently</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onResolve(conflict.id, 'local');
              onClose();
            }}
          >
            Keep Local
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onResolve(conflict.id, 'remote');
              onClose();
            }}
          >
            Use Remote
          </Button>
          <Button
            onClick={() => {
              onResolve(conflict.id, 'merge');
              onClose();
            }}
          >
            Merge Versions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
