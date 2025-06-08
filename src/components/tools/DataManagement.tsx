
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Download, Upload, FileText, Database } from 'lucide-react';
import { storageAdapter } from '@/adapters';
import { LocalStorageAdapter } from '@/adapters/LocalStorageAdapter';
import { useAuth } from '@/contexts';

const DataManagement = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();

  const handleExportGroup = async () => {
    if (!selectedGroupId) {
      toast.error('Please enter a group ID to export');
      return;
    }

    setExporting(true);
    try {
      // Check if we're using LocalStorageAdapter
      if (storageAdapter instanceof LocalStorageAdapter) {
        const jsonData = storageAdapter.exportGroupData(selectedGroupId);
        
        // Create and download file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `group-${selectedGroupId}-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Group data exported successfully!');
      } else {
        toast.error('Export functionality is only available with LocalStorage adapter');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a JSON file');
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        
        // Check if we're using LocalStorageAdapter
        if (storageAdapter instanceof LocalStorageAdapter) {
          storageAdapter.importGroupData(jsonData);
          toast.success('Group data imported successfully!');
          
          // Reload the page to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('Import functionality is only available with LocalStorage adapter');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setImporting(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read file');
      setImporting(false);
    };
    
    reader.readAsText(file);
  };

  const isLocalStorageAdapter = storageAdapter instanceof LocalStorageAdapter;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export and import group data for backup or migration purposes.
            {!isLocalStorageAdapter && (
              <span className="block mt-2 text-amber-600 font-medium">
                Note: This functionality is only available when using the LocalStorage adapter.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <h3 className="text-lg font-medium">Export Group Data</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupId">Group ID</Label>
              <Input
                id="groupId"
                placeholder="Enter group ID to export"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={!isLocalStorageAdapter}
              />
            </div>
            <Button 
              onClick={handleExportGroup} 
              disabled={exporting || !selectedGroupId || !isLocalStorageAdapter}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : '📥 Export Group Data'}
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Import Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <h3 className="text-lg font-medium">Import Group Data</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="importFile">Select JSON file</Label>
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={importing || !isLocalStorageAdapter}
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    <strong>Warning:</strong> Importing will overwrite existing group data with the same ID. 
                    Make sure to export current data first as backup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isLocalStorageAdapter && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                To use data management features, switch to the LocalStorage adapter in your application configuration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.name || 'Not set'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataManagement;
