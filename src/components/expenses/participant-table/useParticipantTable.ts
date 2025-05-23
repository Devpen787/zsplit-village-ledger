
import { useState, useMemo, useEffect } from 'react';
import { ExpenseUser, UserSplitData } from '@/types/expenses';
import { calculateEqualSplit, calculateUserAmount, calculateTotalShares } from '@/utils/expenseSplitUtils';

export function useParticipantTable(
  users: ExpenseUser[],
  splitData: UserSplitData[],
  splitMethod: string,
  totalAmount: number,
  onSplitDataChange: (splitData: UserSplitData[]) => void,
  paidBy: string
) {
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: true, message: '' });

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

  const activeUsers = useMemo(() => {
    return splitData.filter(data => data.isActive !== false);
  }, [splitData]);

  const selectedCount = activeUsers.length;

  // Calculate equal share amount for display
  const equalShareAmount = useMemo(() => {
    return selectedCount > 0 ? totalAmount / selectedCount : 0;
  }, [totalAmount, selectedCount]);

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
    // Never deselect the payer
    const updatedSplitData = splitData.map(data => ({
      ...data,
      isActive: data.userId === paidBy ? true : false
    }));
    
    onSplitDataChange(updatedSplitData);
  };

  // Handle amount change for custom split
  const handleAmountChange = (userId: string, amount: number) => {
    const updatedSplitData = splitData.map(item =>
      item.userId === userId
        ? { ...item, amount: amount }
        : item
    );
    
    onSplitDataChange(updatedSplitData);
  };

  // Handle percentage change for percentage split
  const handlePercentageChange = (userId: string, percentage: number) => {
    const updatedSplitData = splitData.map(item =>
      item.userId === userId
        ? { ...item, percentage: percentage }
        : item
    );
    
    onSplitDataChange(updatedSplitData);
  };

  // Calculate the actual amount a user should pay based on split method
  const getCalculatedAmount = (userData: UserSplitData): number => {
    if (!userData.isActive) return 0;
    
    switch (splitMethod) {
      case 'equal':
        return equalShareAmount;
      case 'amount':
        return userData.amount || 0;
      case 'percentage':
        return totalAmount * ((userData.percentage || 0) / 100);
      default:
        return 0;
    }
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
      
      case 'amount':
        // For custom amounts, we don't automatically recalculate
        return data;
      
      default:
        return data;
    }
  };

  // Validate the split data
  useEffect(() => {
    if (splitMethod === 'amount') {
      const totalAssigned = activeUsers.reduce((sum, item) => sum + (item.amount || 0), 0);
      const diff = Math.abs(totalAmount - totalAssigned);
      
      if (diff > 0.01) {
        setValidationState({
          isValid: false,
          message: totalAssigned > totalAmount 
            ? `Exceeds total by $${(totalAssigned - totalAmount).toFixed(2)}`
            : `$${(totalAmount - totalAssigned).toFixed(2)} left to assign`
        });
      } else {
        setValidationState({
          isValid: true,
          message: 'Amounts add up correctly'
        });
      }
    } else if (splitMethod === 'percentage') {
      const totalPercentage = activeUsers.reduce((sum, item) => sum + (item.percentage || 0), 0);
      const diff = Math.abs(100 - totalPercentage);
      
      if (diff > 0.1) {
        setValidationState({
          isValid: false,
          message: totalPercentage > 100 
            ? `Exceeds 100% by ${(totalPercentage - 100).toFixed(1)}%`
            : `${(100 - totalPercentage).toFixed(1)}% left to assign`
        });
      } else {
        setValidationState({
          isValid: true,
          message: 'Percentages add up to 100%'
        });
      }
    } else {
      setValidationState({
        isValid: true,
        message: ''
      });
    }
  }, [splitData, splitMethod, totalAmount, activeUsers]);

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
    equalShareAmount,
    handleAmountChange,
    handlePercentageChange,
    getCalculatedAmount,
    validation: validationState
  };
}
