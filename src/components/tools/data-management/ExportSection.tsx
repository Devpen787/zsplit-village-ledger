
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Download } from 'lucide-react';
import { storageAdapter } from '@/adapters';
import { LocalStorageAdapter } from '@/adapters/LocalStorageAdapter';

interface ExportSectionProps {
  isLocalStorageAdapter: boolean;
}

const ExportSection = ({ isLocalStorageAdapter }: ExportSectionProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  const handleExportGroup = async () => {
    if (!selectedGroupId) {
      toast.error('Please enter a group ID to export');
      return;
    }

    setExporting(true);
    try {
      if (storageAdapter instanceof LocalStorageAdapter) {
        const jsonData = storageAdapter.exportGroupData(selectedGroupId);
        
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

  return (
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
  );
};

export default ExportSection;
