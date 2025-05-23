
import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

interface TargetAmountInputProps {
  currentTarget: number;
}

export const TargetAmountInput = ({ currentTarget }: TargetAmountInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentTarget.toString());

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(currentTarget.toString());
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    // Here you would normally save the new target amount
    // For now we'll just show a toast message
    toast.success(`Target amount updated to CHF ${inputValue}`);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-2"
        onClick={handleEdit}
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="h-7 w-24 text-xs"
        min="0"
        step="10"
      />
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-1"
        onClick={handleSave}
      >
        <Save className="h-3 w-3" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-1"
        onClick={handleCancel}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
