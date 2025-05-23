
import { UserSplitData } from "@/types/expenses";
import { calculateEqualSplit } from "./expenseCalculationUtils";

/**
 * Generate initial split data from a list of users
 */
export const generateInitialSplitData = (
  users: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    display_name?: string | null;
    isActive?: boolean;
  }>,
  splitMethod: string,
  totalAmount: number,
  paidBy: string
): UserSplitData[] => {
  const activeUserCount = users.filter(u => u.isActive !== false).length;
  
  return users.map(user => {
    // Include user details for better name rendering
    const baseData = { 
      userId: user.id,
      name: user.name,
      email: user.email,
      display_name: user.display_name,
      isActive: user.isActive !== false
    };
    
    switch (splitMethod) {
      case 'equal':
        return {
          ...baseData,
          amount: calculateEqualSplit(totalAmount, activeUserCount),
          percentage: 100 / activeUserCount,
          shares: 1,
        };
      case 'amount':
        return { 
          ...baseData, 
          amount: user.id === paidBy ? totalAmount : 0 
        };
      case 'percentage':
        return { 
          ...baseData, 
          percentage: user.id === paidBy ? 100 : 0 
        };
      case 'shares':
        return { ...baseData, shares: 1 };
      default:
        return baseData;
    }
  });
};

/**
 * Process split data for API submission
 * This function formats the split data for the expense service
 */
export const processSplitData = (
  splitData: UserSplitData[],
  splitMethod: string
) => {
  return splitData
    .filter(item => item.isActive !== false)
    .map(item => {
      let shareValue = 0;
      
      switch (splitMethod) {
        case 'equal':
          shareValue = 1;
          break;
        case 'amount':
          shareValue = item.amount || 0;
          break;
        case 'percentage':
          shareValue = item.percentage || 0;
          break;
        case 'shares':
          shareValue = item.shares || 0;
          break;
      }
      
      return {
        userId: item.userId,
        shareType: splitMethod,
        shareValue
      };
    });
};
