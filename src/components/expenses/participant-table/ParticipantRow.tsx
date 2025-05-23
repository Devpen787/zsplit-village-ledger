
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ExpenseUser } from '@/types/expenses';

interface ParticipantRowProps {
  user: ExpenseUser;
  isActive: boolean;
  isPayer: boolean;
  splitMethod: string;
  amount: number;
  percentage: number;
  shares: number;
  onToggle: () => void;
  onAmountChange: (amount: number) => void;
  onPercentageChange: (percentage: number) => void;
  onSharesChange: (shares: number) => void;
}

export const ParticipantRow: React.FC<ParticipantRowProps> = ({
  user,
  isActive,
  isPayer,
  splitMethod,
  amount,
  percentage,
  shares,
  onToggle,
  onAmountChange,
  onPercentageChange,
  onSharesChange
}) => {
  const userName = user.display_name || user.name || user.email || 'Unknown User';

  return (
    <tr
      className={cn(
        'border-t hover:bg-muted/40', 
        isActive && 'bg-muted/30',
        isPayer && 'font-medium'
      )}
    >
      <td className="p-2">
        <Checkbox
          checked={isActive}
          onCheckedChange={() => onToggle()}
          disabled={isPayer} // Prevent deselecting the payer
        />
      </td>
      <td className="p-2">
        {userName}
        {isPayer && ' (paid)'}
      </td>
      
      {splitMethod === 'equal' && isActive && (
        <td className="p-2 text-right">
          ${amount.toFixed(2)}
        </td>
      )}
      
      {splitMethod === 'equal' && !isActive && (
        <td className="p-2 text-right">-</td>
      )}
      
      {splitMethod === 'amount' && (
        <>
          <td className="p-2 text-right space-x-2 flex items-center justify-end">
            <span>$</span>
            <Input
              type="number"
              value={isActive ? amount || '' : ''}
              onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
              className="w-24 h-8 text-right"
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={!isActive}
            />
          </td>
          <td className="p-2 text-right">
            {isActive ? `$${amount.toFixed(2)}` : '-'}
          </td>
        </>
      )}
      
      {splitMethod === 'percentage' && (
        <>
          <td className="p-2 text-right space-x-2 flex items-center justify-end">
            <Input
              type="number"
              value={isActive ? percentage || '' : ''}
              onChange={(e) => onPercentageChange(parseFloat(e.target.value) || 0)}
              className="w-16 h-8 text-right"
              placeholder="0"
              step="0.1"
              min="0"
              max="100"
              disabled={!isActive}
            />
            <span className="w-4">%</span>
          </td>
          <td className="p-2 text-right">
            {isActive ? `$${amount.toFixed(2)}` : '-'}
          </td>
        </>
      )}
    </tr>
  );
};
