
import React from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantFilters } from './ParticipantFilters';
import { ParticipantTableHeader } from './ParticipantTableHeader';
import { ParticipantRow } from './ParticipantRow';
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
    equalShareAmount
  } = useParticipantTable(
    users,
    splitData,
    splitMethod,
    totalAmount,
    onSplitDataChange,
    paidBy
  );

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
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground mt-2">
        Selected: {selectedCount} participant(s)
      </div>
    </div>
  );
};
