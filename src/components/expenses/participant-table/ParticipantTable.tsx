
import React, { useEffect, useState } from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { getUserDisplayName } from '@/utils/userFormatUtils';
import { ParticipantTableHeader } from './ParticipantTableHeader';
import { ParticipantRow } from './ParticipantRow';
import { calculateEqualSplit, calculateUserAmount, calculateTotalShares } from '@/utils/expenseCalculationUtils';

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
  paidBy,
}) => {
  const [isValid, setIsValid] = useState(true);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [totalCustomAmount, setTotalCustomAmount] = useState(0);
  
  // Toggle participant active status
  const toggleParticipant = (userId: string) => {
    const updatedSplitData = splitData.map(data => {
      if (data.userId === userId) {
        return { ...data, isActive: data.isActive === false ? true : false };
      }
      return data;
    });

    onSplitDataChange(updatedSplitData);
  };

  // Update amount for a specific participant
  const updateAmount = (userId: string, amount: number) => {
    const updatedSplitData = splitData.map(data => {
      if (data.userId === userId) {
        return { ...data, amount };
      }
      return data;
    });

    onSplitDataChange(updatedSplitData);
  };

  // Update percentage for a specific participant
  const updatePercentage = (userId: string, percentage: number) => {
    const updatedSplitData = splitData.map(data => {
      if (data.userId === userId) {
        return { ...data, percentage };
      }
      return data;
    });

    onSplitDataChange(updatedSplitData);
  };

  // Update shares for a specific participant
  const updateShares = (userId: string, shares: number) => {
    const updatedSplitData = splitData.map(data => {
      if (data.userId === userId) {
        return { ...data, shares };
      }
      return data;
    });

    onSplitDataChange(updatedSplitData);
  };
  
  // Get the calculated amount for a participant
  const getParticipantAmount = (participant: UserSplitData): number => {
    if (participant.isActive === false) return 0;
    
    const activeUsers = splitData.filter(data => data.isActive !== false);
    const activeCount = activeUsers.length || 1;
    const totalShares = calculateTotalShares(splitData);
    
    switch (splitMethod) {
      case 'equal':
        return calculateEqualSplit(totalAmount, activeCount);
      case 'percentage':
        return totalAmount * ((participant.percentage || 0) / 100);
      case 'amount':
        return participant.amount || 0;
      default:
        return 0;
    }
  };
  
  // Calculate the even split amount
  const calculateEvenSplitAmount = (): number => {
    const activeUsers = splitData.filter(data => data.isActive !== false);
    const activeCount = activeUsers.length || 1;
    return calculateEqualSplit(totalAmount, activeCount);
  };

  // Calculate and validate totals
  useEffect(() => {
    const activeUsers = splitData.filter(data => data.isActive !== false);
    
    if (splitMethod === 'percentage') {
      const totalPerc = activeUsers.reduce((sum, item) => sum + (item.percentage || 0), 0);
      setTotalPercentage(totalPerc);
      setIsValid(Math.abs(100 - totalPerc) <= 0.1);
    } else if (splitMethod === 'amount') {
      const totalAmt = activeUsers.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalCustomAmount(totalAmt);
      setIsValid(Math.abs(totalAmount - totalAmt) <= 0.01);
    } else {
      setIsValid(true);
    }
  }, [splitData, splitMethod, totalAmount]);

  // Initialize split data with even values when split method changes
  useEffect(() => {
    if (splitMethod && users.length > 0) {
      const activeUsers = splitData.filter(data => data.isActive !== false);
      const activeCount = activeUsers.length || 1;

      const equalAmount = totalAmount / activeCount;
      const equalPercentage = 100 / activeCount;

      const updatedSplitData = splitData.map(data => {
        // Only update values for active participants
        if (data.isActive !== false) {
          switch (splitMethod) {
            case 'equal':
              return { ...data, amount: equalAmount };
            case 'amount':
              return { ...data, amount: data.amount || 0 };
            case 'percentage':
              return { ...data, percentage: data.percentage || equalPercentage };
            case 'shares':
              return { ...data, shares: data.shares || 1 };
            default:
              return data;
          }
        }
        return data;
      });

      onSplitDataChange(updatedSplitData);
    }
  }, [splitMethod, users.length, totalAmount]);

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <ParticipantTableHeader splitMethod={splitMethod} />
        <tbody>
          {splitData.map((participant) => {
            const user = users.find(u => u.id === participant.userId);
            if (!user) return null;

            return (
              <ParticipantRow
                key={participant.userId}
                user={{
                  id: user.id,
                  name: getUserDisplayName(user),
                  email: user.email || '',
                  display_name: user.display_name || undefined
                }}
                isActive={participant.isActive !== false}
                isPayer={participant.userId === paidBy}
                splitMethod={splitMethod}
                amount={getParticipantAmount(participant)}
                percentage={participant.percentage || 0}
                shares={participant.shares || 1}
                onToggle={() => toggleParticipant(participant.userId)}
                onAmountChange={(amount) => updateAmount(participant.userId, amount)}
                onPercentageChange={(percentage) => updatePercentage(participant.userId, percentage)}
                onSharesChange={(shares) => updateShares(participant.userId, shares)}
              />
            );
          })}
        </tbody>
      </table>
      
      {/* Summary footer */}
      <div className="bg-muted/50 p-3 border-t">
        {splitMethod === 'amount' && (
          <div className="flex justify-between text-sm">
            <span>Total allocated:</span>
            <span className={`font-medium ${!isValid ? 'text-red-600' : ''}`}>
              {totalCustomAmount.toFixed(2)} / {totalAmount.toFixed(2)}
            </span>
          </div>
        )}
        
        {splitMethod === 'percentage' && (
          <div className="flex justify-between text-sm">
            <span>Total percentage:</span>
            <span className={`font-medium ${!isValid ? 'text-red-600' : ''}`}>
              {totalPercentage.toFixed(1)}%
            </span>
          </div>
        )}
        
        {splitMethod === 'equal' && (
          <div className="flex justify-between text-sm">
            <span>Equal split amount:</span>
            <span className="font-medium">
              {calculateEvenSplitAmount().toFixed(2)} per person
            </span>
          </div>
        )}
        
        {!isValid && (
          <p className="text-red-600 text-xs mt-1">
            {splitMethod === 'amount' 
              ? "Total allocated amount must equal the expense total" 
              : "Total percentage must equal 100%"}
          </p>
        )}
      </div>
    </div>
  );
};
