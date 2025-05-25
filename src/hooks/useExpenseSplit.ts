import { useState, useEffect } from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { 
  calculateUserAmount, 
  validateSplitData, 
  generateInitialSplitData,
  calculateTotalShares
} from "@/utils/expenseSplitUtils";
import { getUserDisplayName } from "@/utils/userUtils";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  display_name?: string | null;
  isActive?: boolean;
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

  // Initialize or reset split data when users, split method, or total amount changes
  useEffect(() => {
    if (users.length > 0) {
      const initialData = generateInitialSplitData(users, splitMethod, totalAmount, paidBy);
      setSplitData(initialData);
      
      const validation = validateSplitData(initialData, splitMethod, totalAmount);
      setIsValid(validation.isValid);
      setValidationError(validation.errorMessage);
    } else {
      // If no users are selected, clear the split data
      setSplitData([]);
      setValidationError("No participants selected");
      setIsValid(false);
    }
  }, [users, splitMethod, totalAmount, paidBy]);

  // Validate and update parent component when split data changes
  useEffect(() => {
    if (splitData.length > 0) {
      const validation = validateSplitData(splitData, splitMethod, totalAmount);
      setIsValid(validation.isValid);
      setValidationError(validation.errorMessage);
      
      if (validation.isValid) {
        onSplitDataChange(splitData);
      }
    }
  }, [splitData, splitMethod, totalAmount, onSplitDataChange]);

  const handleInputChange = (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => {
    const numValue = parseFloat(value) || 0;
    
    const newSplitData = splitData.map(item => 
      item.userId === userId 
        ? { ...item, [field]: numValue } 
        : item
    );
    
    setSplitData(newSplitData);
  };

  const adjustShares = (userId: string, adjustment: number) => {
    const newSplitData = splitData.map(item => 
      item.userId === userId 
        ? { ...item, shares: Math.max(1, (item.shares || 1) + adjustment) } 
        : item
    );
    
    setSplitData(newSplitData);
  };

  const getCalculatedAmount = (userData: UserSplitData): number => {
    // Only count active users for calculations
    const activeUserCount = splitData.filter(u => u.isActive !== false).length;
    const totalShares = calculateTotalShares(splitData);
    
    return calculateUserAmount(userData, splitMethod, totalAmount, activeUserCount, totalShares);
  };

  const getTotalShares = (): number => {
    return calculateTotalShares(splitData);
  };

  // Mark a user as active or inactive without removing them from the array
  const toggleUserActive = (userId: string, isActive: boolean) => {
    // Never deactivate the payer
    if (userId === paidBy && !isActive) return;
    
    const newSplitData = splitData.map(item => 
      item.userId === userId 
        ? { ...item, isActive } 
        : item
    );
    
    setSplitData(newSplitData);
  };

  return {
    splitData,
    validationError,
    isValid,
    handleInputChange,
    adjustShares,
    getCalculatedAmount,
    getTotalShares,
    getUserName: getUserDisplayName,
    toggleUserActive
  };
};
