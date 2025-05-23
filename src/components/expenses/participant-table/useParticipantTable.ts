
import { useState, useMemo } from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';

export function useParticipantTable(
  users: ExpenseUser[],
  splitData: UserSplitData[],
  splitMethod: string,
  totalAmount: number,
  onSplitDataChange: (splitData: UserSplitData[]) => void,
  paidBy: string
) {
  const [groupFilter, setGroupFilter] = useState<string>('All');

  // Get unique groups from users
  const groupOptions = useMemo(() => {
    return Array.from(
      new Set(users.map((user) => user.group_id).filter(Boolean))
    ) as string[];
  }, [users]);
  
  // Map group IDs to names (in a real app, you'd fetch these)
  const groupNames: Record<string, string> = {};
  groupOptions.forEach((groupId) => {
    groupNames[groupId] = `Group ${groupId}`;
  });

  const filteredUsers = useMemo(() => {
    return groupFilter === 'All'
      ? users
      : users.filter((user) => user.group_id === groupFilter);
  }, [users, groupFilter]);

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

  return {
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
  };
}
