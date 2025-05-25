
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { getUserDisplayName, getUserInitials } from '@/utils/userUtils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreditCard } from 'lucide-react';
import { formatAmount } from '@/utils/money';

interface ParticipantRowProps {
  user: ExpenseUser;
  userData: UserSplitData;
  isUserSelected: boolean;
  isPayer: boolean;
  toggleSelection: (userId: string) => void;
  splitMethod: string;
  equalShareAmount?: number;
  onCustomInputChange?: (userId: string, value: string, field: 'amount' | 'percentage') => void;
  getCalculatedAmount?: (userData: UserSplitData) => number;
}

export const ParticipantRow: React.FC<ParticipantRowProps> = ({
  user,
  userData,
  isUserSelected,
  isPayer,
  toggleSelection,
  splitMethod,
  equalShareAmount = 0,
  onCustomInputChange,
  getCalculatedAmount
}) => {
  // Calculate the amount for display if the function is provided
  const calculatedAmount = getCalculatedAmount ? getCalculatedAmount(userData) : equalShareAmount;

  const renderSplitMethodCell = () => {
    if (!isUserSelected) {
      return <td className="p-2 text-right">-</td>;
    }

    switch (splitMethod) {
      case 'equal':
        return (
          <td className="p-3 text-right">
            <Badge variant="outline" className="bg-primary/5">
              ${formatAmount(equalShareAmount)}
            </Badge>
          </td>
        );
      
      case 'amount':
        return (
          <td className="p-3 text-right space-x-2 flex items-center justify-end">
            <span className="text-muted-foreground">$</span>
            <Input
              type="number"
              value={userData.amount || ''}
              onChange={(e) => onCustomInputChange?.(user.id, e.target.value, 'amount')}
              className="w-24 h-8 text-right"
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={!isUserSelected}
            />
          </td>
        );
      
      case 'percentage':
        return (
          <td className="p-3 text-right space-x-2 flex items-center justify-end">
            <Input
              type="number"
              value={userData.percentage || ''}
              onChange={(e) => onCustomInputChange?.(user.id, e.target.value, 'percentage')}
              className="w-16 h-8 text-right"
              placeholder="0"
              step="0.1"
              min="0"
              max="100"
              disabled={!isUserSelected}
            />
            <span className="w-4">%</span>
            <span className="text-sm text-muted-foreground ml-1">
              (${formatAmount(calculatedAmount)})
            </span>
          </td>
        );
      
      default:
        return <td className="p-2 text-right">-</td>;
    }
  };

  return (
    <TooltipProvider>
      <tr
        className={cn(
          'border-t hover:bg-muted/40 transition-colors', 
          isUserSelected && 'bg-muted/30',
          isPayer && 'bg-primary/5'
        )}
      >
        <td className="p-3">
          <Checkbox
            checked={isUserSelected}
            onCheckedChange={() => toggleSelection(user.id)}
            disabled={isPayer} // Prevent deselecting the payer
          />
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <span className={isPayer ? "font-medium" : ""}>
              {getUserDisplayName(user)}
            </span>
            {isPayer && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-primary/10 text-xs">
                    <CreditCard className="h-3 w-3 mr-1" />
                    paid
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This user paid for the expense</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </td>
        
        {renderSplitMethodCell()}
        
        {splitMethod !== 'equal' && (
          <td className="p-3 text-right">
            {isUserSelected ? (
              <Badge variant="outline" className="bg-primary/5">
                ${formatAmount(calculatedAmount)}
              </Badge>
            ) : (
              '-'
            )}
          </td>
        )}
      </tr>
    </TooltipProvider>
  );
};
