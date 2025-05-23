
import React, { useState } from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantFilters } from './ParticipantFilters';
import { ParticipantTableHeader } from './ParticipantTableHeader';
import { ParticipantRow } from './ParticipantRow';
import { useParticipantTable } from './useParticipantTable';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

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

  return (
    <div className="space-y-4">
      <ParticipantFilters
        groupFilter={groupFilter}
        setGroupFilter={setGroupFilter}
        groupOptions={groupOptions}
        groupNames={groupNames}
        handleSelectAllVisible={handleSelectAllVisible}
        handleDeselectAll={handleDeselectAll}
      />

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
      {splitMethod === 'amount' && (
        <div className={cn(
          "text-sm mb-4 flex items-center",
          validation.isValid ? "text-green-600" : "text-amber-600"
        )}>
          {validation.isValid ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Amounts add up to {totalAmount.toFixed(2)}
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              {validation.message}
            </>
          )}
        </div>
      )}

      {splitMethod === 'percentage' && (
        <div className={cn(
          "text-sm mb-4 flex items-center",
          validation.isValid ? "text-green-600" : "text-amber-600"
        )}>
          {validation.isValid ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Percentages add up to 100%
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              {validation.message}
            </>
          )}
        </div>
      )}

      <div className="text-sm text-muted-foreground mt-2">
        Selected: {selectedCount} participant(s)
      </div>
    </div>
  );
};
