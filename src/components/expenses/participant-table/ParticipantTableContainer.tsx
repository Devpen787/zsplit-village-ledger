
import React from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantTableHeader } from './ParticipantTableHeader';
import { ParticipantRow } from './ParticipantRow';

interface ParticipantTableContainerProps {
  users: ExpenseUser[];
  splitData: UserSplitData[];
  splitMethod: string;
  totalAmount: number;
  paidBy: string;
  filteredUsers: ExpenseUser[];
  isSelected: (userId: string) => boolean;
  toggleSelection: (userId: string) => void;
  equalShareAmount: number;
  handleCustomInputChange: (userId: string, value: string, field: 'amount' | 'percentage') => void;
  getCalculatedAmount: (userData: UserSplitData) => number;
}

export const ParticipantTableContainer: React.FC<ParticipantTableContainerProps> = ({
  splitData,
  splitMethod,
  paidBy,
  filteredUsers,
  isSelected,
  toggleSelection,
  equalShareAmount,
  handleCustomInputChange,
  getCalculatedAmount
}) => {
  return (
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
  );
};
