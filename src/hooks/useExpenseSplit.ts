
import { useState, useEffect } from "react";
import { UserSplitData } from "@/types/expenses";

type User = {
  id: string;
  name?: string | null;
  email: string | null;
};

interface UseExpenseSplitProps {
  users: User[];
  totalAmount: number;
  paidBy: string;
  splitMethod: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
}

export const useExpenseSplit = ({
  users,
  totalAmount,
  paidBy,
  splitMethod,
  onSplitDataChange
}: UseExpenseSplitProps) => {
  const [splitData, setSplitData] = useState<UserSplitData[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  // Initialize or reset split data when users or split method changes
  useEffect(() => {
    if (users.length > 0) {
      const initialData = users.map(user => {
        const baseData = { userId: user.id };
        
        switch (splitMethod) {
          case 'equal':
            return {
              ...baseData,
              amount: calculateEqualSplit(users.length),
              percentage: 100 / users.length,
              shares: 1,
            };
          case 'amount':
            return { ...baseData, amount: 0 };
          case 'percentage':
            return { ...baseData, percentage: 0 };
          case 'shares':
            return { ...baseData, shares: 1 };
          default:
            return baseData;
        }
      });
      
      setSplitData(initialData);
      validateSplitData(initialData, splitMethod);
    }
  }, [users, splitMethod, totalAmount]);

  // Validate and update parent component when split data changes
  useEffect(() => {
    if (splitData.length > 0) {
      const isDataValid = validateSplitData(splitData, splitMethod);
      
      if (isDataValid) {
        onSplitDataChange(splitData);
      }
    }
  }, [splitData, totalAmount]);

  const calculateEqualSplit = (numUsers: number): number => {
    if (numUsers === 0 || !totalAmount) return 0;
    return parseFloat((totalAmount / numUsers).toFixed(2));
  };

  const validateSplitData = (data: UserSplitData[], method: string): boolean => {
    if (!totalAmount || totalAmount <= 0) {
      setValidationError("Please enter a valid total amount");
      setIsValid(false);
      return false;
    }

    if (method === "amount") {
      const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      if (Math.abs(total - totalAmount) > 0.01) {
        setValidationError(`Total must equal ${totalAmount.toFixed(2)}. Current total: ${total.toFixed(2)}`);
        setIsValid(false);
        return false;
      }
    } else if (method === "percentage") {
      const total = data.reduce((sum, item) => sum + (item.percentage || 0), 0);
      
      if (Math.abs(total - 100) > 0.01) {
        setValidationError(`Percentages must sum to 100%. Current total: ${total.toFixed(1)}%`);
        setIsValid(false);
        return false;
      }
    }

    setValidationError(null);
    setIsValid(true);
    return true;
  };

  const handleInputChange = (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => {
    const numValue = parseFloat(value) || 0;
    
    const newSplitData = splitData.map(item => 
      item.userId === userId 
        ? { ...item, [field]: numValue } 
        : item
    );
    
    setSplitData(newSplitData);
    validateSplitData(newSplitData, splitMethod);
  };

  const adjustShares = (userId: string, adjustment: number) => {
    const newSplitData = splitData.map(item => 
      item.userId === userId 
        ? { ...item, shares: Math.max(1, (item.shares || 1) + adjustment) } 
        : item
    );
    
    setSplitData(newSplitData);
    validateSplitData(newSplitData, splitMethod);
  };

  const getCalculatedAmount = (userData: UserSplitData): number => {
    switch (splitMethod) {
      case "equal":
        return calculateEqualSplit(users.length);
      case "percentage":
        return parseFloat(((userData.percentage || 0) * totalAmount / 100).toFixed(2));
      case "shares":
        const totalShares = splitData.reduce((sum, item) => sum + (item.shares || 0), 0);
        if (totalShares === 0) return 0;
        return parseFloat(((userData.shares || 0) / totalShares * totalAmount).toFixed(2));
      default:
        return userData.amount || 0;
    }
  };

  const getTotalShares = (): number => {
    return splitData.reduce((sum, item) => sum + (item.shares || 0), 0);
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || user?.email || "User";
  };

  return {
    splitData,
    validationError,
    isValid,
    handleInputChange,
    adjustShares,
    getCalculatedAmount,
    getTotalShares,
    getUserName
  };
};
