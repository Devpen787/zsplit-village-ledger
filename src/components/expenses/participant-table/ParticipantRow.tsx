
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { formatUserName } from '@/utils/userFormatUtils';

interface ParticipantRowProps {
  user: ExpenseUser;
  userData: UserSplitData;
  isUserSelected: boolean;
  isPayer: boolean;
  toggleSelection: (userId: string) => void;
  splitMethod: string;
  equalShareAmount?: number;
}

export const ParticipantRow: React.FC<ParticipantRowProps> = ({
  user,
  userData,
  isUserSelected,
  isPayer,
  toggleSelection,
  splitMethod,
  equalShareAmount = 0,
}) => {
  return (
    <tr
      className={cn(
        'border-t hover:bg-muted/40', 
        isUserSelected && 'bg-muted/30',
        isPayer && 'font-medium'
      )}
    >
      <td className="p-2">
        <Checkbox
          checked={isUserSelected}
          onCheckedChange={() => toggleSelection(user.id)}
          disabled={isPayer} // Prevent deselecting the payer
        />
      </td>
      <td className="p-2">
        {formatUserName(user)}
        {isPayer && ' (paid)'}
      </td>
      
      {splitMethod === 'equal' && (
        <td className="p-2 text-right">
          {isUserSelected ? `$${equalShareAmount.toFixed(2)}` : '-'}
        </td>
      )}
      
      {splitMethod === 'percentage' && (
        <td className="p-2 text-right">
          {isUserSelected ? `${userData.percentage || 0}%` : '-'}
        </td>
      )}
      
      {splitMethod === 'shares' && (
        <td className="p-2 text-right">
          {isUserSelected ? userData.shares || 1 : '-'}
        </td>
      )}
      
      {splitMethod !== 'equal' && (
        <td className="p-2 text-right">
          {isUserSelected ? `$${(userData.amount || 0).toFixed(2)}` : '-'}
        </td>
      )}
    </tr>
  );
};
