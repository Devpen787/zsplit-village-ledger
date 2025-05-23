
import React from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantTable } from './ParticipantTable';

interface UnifiedParticipantTableProps {
  users: ExpenseUser[];
  splitData: UserSplitData[];
  splitMethod: string;
  totalAmount: number;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  paidBy: string;
}

export const UnifiedParticipantTable: React.FC<UnifiedParticipantTableProps> = (props) => {
  return <ParticipantTable {...props} />;
};
