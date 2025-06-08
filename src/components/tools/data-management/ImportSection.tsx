
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Upload, FileText } from 'lucide-react';
import { storageAdapter } from '@/adapters';
import { LocalStorageAdapter } from '@/adapters/LocalStorageAdapter';

interface ImportSectionProps {
  isLocalStorageAdapter: boolean;
}

const ImportSection = ({ isLocalStorageAdapter }: ImportSectionProps) => {
  const [importing, setImporting] = useState(false);

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
        
        if (storageAdapter instanceof LocalStorageAdapter) {
          storageAdapter.importGroupData(jsonData);
          toast.success('Group data imported successfully!');
          
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

  return (
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
  );
};

export default ImportSection;
