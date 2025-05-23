
import React from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantTable } from './ParticipantTable';
import { Card, CardContent } from '@/components/ui/card';

interface UnifiedParticipantTableProps {
  users: ExpenseUser[];
  splitData: UserSplitData[];
  splitMethod: string;
  totalAmount: number;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  paidBy: string;
}

export const UnifiedParticipantTable: React.FC<UnifiedParticipantTableProps> = (props) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <ParticipantTable {...props} />
      </CardContent>
    </Card>
  );
};
