
import React from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantFilters } from './ParticipantFilters';
import { SplitMethodHelpText } from './SplitMethodHelpText';
import { ParticipantTableContainer } from './ParticipantTableContainer';
import { ValidationSummary } from './ValidationSummary';
import { useParticipantTable } from './useParticipantTable';

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

  const handleCustomInputChange = (userId: string, value: string, field: 'amount' | 'percentage') => {
    const numValue = parseFloat(value) || 0;
    if (field === 'amount') {
      handleAmountChange(userId, numValue);
    } else if (field === 'percentage') {
      handlePercentageChange(userId, numValue);
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

      <SplitMethodHelpText splitMethod={splitMethod} />

      <ParticipantTableContainer
        users={users}
        splitData={splitData}
        splitMethod={splitMethod}
        totalAmount={totalAmount}
        paidBy={paidBy}
        filteredUsers={filteredUsers}
        isSelected={isSelected}
        toggleSelection={toggleSelection}
        equalShareAmount={equalShareAmount}
        handleCustomInputChange={handleCustomInputChange}
        getCalculatedAmount={getCalculatedAmount}
      />

      <ValidationSummary
        splitMethod={splitMethod}
        totalAmount={totalAmount}
        validation={validation}
      />

      <div className="text-sm text-muted-foreground mt-2">
        Selected: {selectedCount} participant(s)
      </div>
    </div>
  );
};
