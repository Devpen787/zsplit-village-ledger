
import React from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { ParticipantTable } from './ParticipantTable';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnifiedParticipantTableProps {
  users: ExpenseUser[];
  splitData: UserSplitData[];
  splitMethod: string;
  totalAmount: number;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  paidBy: string;
}

export const UnifiedParticipantTable: React.FC<UnifiedParticipantTableProps> = (props) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`shadow-sm ${isMobile ? 'overflow-x-auto' : ''}`}>
      <CardContent className={`p-0 ${isMobile ? 'min-w-[400px]' : ''}`}>
        <ParticipantTable {...props} />
      </CardContent>
    </Card>
  );
};
