
import React, { useState } from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantFilters } from './ParticipantFilters';
import { ParticipantTableHeader } from './ParticipantTableHeader';
import { ParticipantRow } from './ParticipantRow';
import { useParticipantTable } from './useParticipantTable';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, Info } from "lucide-react";
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParticipantTableProps {
  users: ExpenseUser[];
  splitData: UserSplitData[];
  splitMethod: string;
  totalAmount: number;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  paidBy: string;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  users,
  splitData,
  splitMethod,
  totalAmount,
  onSplitDataChange,
  paidBy
}) => {
  const {
    groupFilter,
    setGroupFilter,
    groupOptions,
    groupNames,
    filteredUsers,
    isSelected,
    toggleSelection,
    handleSelectAllVisible,
    handleDeselectAll,
    selectedCount,
    equalShareAmount,
    handleAmountChange,
    handlePercentageChange,
    getCalculatedAmount,
    validation
  } = useParticipantTable(
    users,
    splitData,
    splitMethod,
    totalAmount,
    onSplitDataChange,
    paidBy
  );

  // Add handlers for custom inputs
  const handleCustomInputChange = (userId: string, value: string, field: 'amount' | 'percentage') => {
    const numValue = parseFloat(value) || 0;
    if (field === 'amount') {
      handleAmountChange(userId, numValue);
    } else if (field === 'percentage') {
      handlePercentageChange(userId, numValue);
    }
  };

  // Render the help text based on split method
  const renderSplitMethodHelp = () => {
    switch (splitMethod) {
      case 'equal':
        return (
          <div className="text-sm text-muted-foreground flex items-center mb-2">
            <Info size={14} className="mr-1" />
            All selected participants will pay the same amount
          </div>
        );
      case 'amount':
        return (
          <div className="text-sm text-muted-foreground flex items-center mb-2">
            <Info size={14} className="mr-1" />
            Specify exact amounts for each participant
          </div>
        );
      case 'percentage':
        return (
          <div className="text-sm text-muted-foreground flex items-center mb-2">
            <Info size={14} className="mr-1" />
            Percentages must add up to 100%
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <ParticipantFilters
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        groupOptions={groupOptions}
        groupNames={groupNames}
        handleSelectAllVisible={handleSelectAllVisible}
        handleDeselectAll={handleDeselectAll}
      />

      {renderSplitMethodHelp()}

      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <ParticipantTableHeader splitMethod={splitMethod} />
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const userData = splitData.find(data => data.userId === user.id) || { userId: user.id };
              const isUserSelected = isSelected(user.id);
              const isPayer = user.id === paidBy;
              
              return (
                <ParticipantRow
                  key={user.id}
                  user={user}
                  userData={userData}
                  isUserSelected={isUserSelected}
                  isPayer={isPayer}
                  toggleSelection={toggleSelection}
                  splitMethod={splitMethod}
                  equalShareAmount={equalShareAmount}
                  onCustomInputChange={handleCustomInputChange}
                  getCalculatedAmount={getCalculatedAmount}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Split method summary and validation */}
      <TooltipProvider>
        {splitMethod === 'amount' && (
          <div className={cn(
            "text-sm mb-4 flex items-center p-2 rounded-md",
            validation.isValid ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          )}>
            {validation.isValid ? (
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Amounts add up to {totalAmount.toFixed(2)}
                </TooltipTrigger>
                <TooltipContent>
                  <p>All participant amounts total correctly</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {validation.message}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adjust amounts to match the total expense amount</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {splitMethod === 'percentage' && (
          <div className={cn(
            "text-sm mb-4 flex items-center p-2 rounded-md",
            validation.isValid ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          )}>
            {validation.isValid ? (
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Percentages add up to 100%
                </TooltipTrigger>
                <TooltipContent>
                  <p>All percentages total to exactly 100%</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {validation.message}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adjust percentages so they total 100%</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </TooltipProvider>

      <div className="text-sm text-muted-foreground mt-2">
        Selected: {selectedCount} participant(s)
      </div>
    </div>
  );
};
