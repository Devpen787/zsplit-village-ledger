
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { formatUserName } from '@/utils/userFormatUtils';

interface UnifiedParticipantTableProps {
  users: ExpenseUser[];
  splitData: UserSplitData[];
  splitMethod: string;
  totalAmount: number;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  paidBy: string;
}

export const UnifiedParticipantTable: React.FC<UnifiedParticipantTableProps> = ({
  users,
  splitData,
  splitMethod,
  totalAmount,
  onSplitDataChange,
  paidBy
}) => {
  const [groupFilter, setGroupFilter] = React.useState<string>('All');

  // Get unique groups from users
  const groupOptions = Array.from(
    new Set(users.map((user) => user.group_id).filter(Boolean))
  );
  
  // Map group IDs to names (in a real app, you'd fetch these)
  const groupNames: Record<string, string> = {};
  groupOptions.forEach((groupId) => {
    groupNames[groupId as string] = `Group ${groupId}`;
  });

  const filteredUsers = groupFilter === 'All'
    ? users
    : users.filter((user) => user.group_id === groupFilter);

  const isSelected = (userId: string) => {
    const userData = splitData.find(data => data.userId === userId);
    return userData?.isActive !== false;
  };

  const toggleSelection = (userId: string) => {
    const updatedSplitData = [...splitData];
    const index = updatedSplitData.findIndex(data => data.userId === userId);
    
    if (index >= 0) {
      updatedSplitData[index] = {
        ...updatedSplitData[index],
        isActive: !updatedSplitData[index].isActive
      };
    } else {
      updatedSplitData.push({
        userId,
        isActive: true
      });
    }
    
    onSplitDataChange(recalculateSplitValues(updatedSplitData));
  };

  const handleSelectAllVisible = () => {
    const visibleUserIds = filteredUsers.map(user => user.id);
    let updatedSplitData = [...splitData];
    
    visibleUserIds.forEach(userId => {
      const index = updatedSplitData.findIndex(data => data.userId === userId);
      if (index >= 0) {
        updatedSplitData[index] = {
          ...updatedSplitData[index],
          isActive: true
        };
      } else {
        updatedSplitData.push({
          userId,
          isActive: true
        });
      }
    });
    
    onSplitDataChange(recalculateSplitValues(updatedSplitData));
  };

  const handleDeselectAll = () => {
    const updatedSplitData = splitData.map(data => ({
      ...data,
      isActive: false
    }));
    
    onSplitDataChange(updatedSplitData);
  };

  // Helper function to recalculate split values based on active users
  const recalculateSplitValues = (data: UserSplitData[]): UserSplitData[] => {
    const activeUsers = data.filter(item => item.isActive !== false);
    const activeCount = activeUsers.length;
    
    if (activeCount === 0 || !totalAmount) return data;
    
    switch (splitMethod) {
      case 'equal':
        const equalAmount = totalAmount / activeCount;
        return data.map(item => ({
          ...item,
          amount: item.isActive !== false ? equalAmount : 0
        }));
      
      case 'percentage':
        const defaultPercentage = 100 / activeCount;
        return data.map(item => ({
          ...item,
          percentage: item.isActive !== false ? 
            (item.percentage || defaultPercentage) : 0,
          amount: item.isActive !== false ? 
            totalAmount * (item.percentage || defaultPercentage) / 100 : 0
        }));
      
      case 'shares':
        const totalShares = activeUsers.reduce((sum, item) => sum + (item.shares || 1), 0);
        return data.map(item => ({
          ...item,
          shares: item.isActive !== false ? (item.shares || 1) : 0,
          amount: item.isActive !== false ? 
            totalAmount * (item.shares || 1) / totalShares : 0
        }));
      
      default: // custom amounts
        return data;
    }
  };

  // Calculate how many active users are selected
  const selectedCount = splitData.filter(data => data.isActive !== false).length;

  // Calculate equal share amount for display
  const equalShareAmount = selectedCount > 0 ? totalAmount / selectedCount : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span>Filter by group:</span>
          <select
            className="border px-3 py-2 rounded"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="All">All</option>
            {groupOptions.map((groupId) => (
              <option key={groupId as string} value={groupId as string}>
                {groupNames[groupId as string] || `Group ${groupId}`}
              </option>
            ))}
          </select>
        </div>

        <Button type="button" variant="outline" onClick={handleSelectAllVisible}>Select All Visible</Button>
        <Button type="button" variant="outline" onClick={handleDeselectAll}>Deselect All</Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted text-left border-b">
              <th className="p-2">Select</th>
              <th className="p-2">Name</th>
              {splitMethod === 'equal' && <th className="p-2 text-right">Share</th>}
              {splitMethod === 'percentage' && <th className="p-2 text-right">Percentage</th>}
              {splitMethod === 'shares' && <th className="p-2 text-right">Shares</th>}
              {splitMethod !== 'equal' && <th className="p-2 text-right">Amount</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const userData = splitData.find(data => data.userId === user.id) || { userId: user.id };
              const isUserSelected = isSelected(user.id);
              const isPayer = user.id === paidBy;
              
              return (
                <tr
                  key={user.id}
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
