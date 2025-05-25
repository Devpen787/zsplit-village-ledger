import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { handleError, ValidationError } from '@/utils/errorHandler';

interface TargetAmountInputProps {
  currentTarget: number;
  onSave?: (newTarget: number) => Promise<void>;
  disabled?: boolean;
}

export const TargetAmountInput = ({ 
  currentTarget, 
  onSave,
  disabled = false 
}: TargetAmountInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentTarget.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setInputValue(currentTarget.toString());
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(currentTarget.toString());
  };

  const validateInput = (value: string): number => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      throw new ValidationError('Please enter a valid number');
    }
    
    if (numValue < 0) {
      throw new ValidationError('Target amount cannot be negative');
    }
    
    if (numValue > 1000000) {
      throw new ValidationError('Target amount is too large');
    }
    
    return numValue;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const newTarget = validateInput(inputValue);
      
      if (onSave) {
        await onSave(newTarget);
        toast.success(`Target amount updated to CHF ${newTarget.toFixed(2)}`);
      } else {
        // Fallback behavior for when no save function is provided
        toast.success(`Target amount set to CHF ${newTarget.toFixed(2)}`);
      }
      
      setIsEditing(false);
    } catch (error) {
      handleError(error, 'TargetAmountInput.handleSave');
      // Keep editing mode open on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-2"
        onClick={handleEdit}
        disabled={disabled}
        aria-label="Edit target amount"
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
        onKeyDown={handleKeyDown}
        className="h-7 w-24 text-xs"
        min="0"
        max="1000000"
        step="10"
        disabled={isSaving}
        autoFocus
        aria-label="Target amount input"
      />
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-1"
        onClick={handleSave}
        disabled={isSaving}
        aria-label="Save target amount"
      >
        <Save className="h-3 w-3" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 px-1"
        onClick={handleCancel}
        disabled={isSaving}
        aria-label="Cancel editing"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
