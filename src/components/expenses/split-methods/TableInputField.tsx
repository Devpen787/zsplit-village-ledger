
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TableInputFieldProps {
  userId: string;
  value: number | undefined;
  fieldType: 'amount' | 'percentage' | 'shares';
  placeholder: string;
  step: string;
  selectedUsers: Record<string, boolean>;
  handleInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares?: (userId: string, adjustment: number) => void;
}

const TableInputField: React.FC<TableInputFieldProps> = ({
  userId,
  value,
  fieldType,
  placeholder,
  step,
  selectedUsers,
  handleInputChange,
  adjustShares
}) => {
  const isActive = selectedUsers[userId] !== false;
  const isShares = fieldType === "shares";
  
  return (
    <div className="flex items-center space-x-2">
      {isShares && adjustShares && (
        <button 
          type="button"
          className={cn(
            "p-1 rounded-md text-xs bg-gray-200 hover:bg-gray-300",
            !isActive && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => adjustShares(userId, -1)}
          disabled={!isActive || value === 1}
        >
          -
        </button>
      )}
      
      <Input
        type="number"
        className={cn("h-8 w-20", !isActive && "opacity-50")}
        placeholder={placeholder}
        step={step}
        value={value === 0 || value === undefined ? '' : value}
        onChange={(e) => handleInputChange(userId, e.target.value, fieldType)}
        disabled={!isActive}
      />
      
      {isShares && adjustShares && (
        <button 
          type="button"
          className={cn(
            "p-1 rounded-md text-xs bg-gray-200 hover:bg-gray-300",
            !isActive && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => adjustShares(userId, 1)}
          disabled={!isActive}
        >
          +
        </button>
      )}
    </div>
  );
};

export default TableInputField;
