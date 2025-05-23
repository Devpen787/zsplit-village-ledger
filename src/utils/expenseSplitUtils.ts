
import { UserSplitData } from "@/types/expenses";

/**
 * Calculate equal split amount based on number of active participants
 */
export const calculateEqualSplit = (totalAmount: number, numUsers: number): number => {
  if (numUsers === 0 || !totalAmount) return 0;
  return parseFloat((totalAmount / numUsers).toFixed(2));
};

/**
 * Calculate the actual amount a user should pay based on their split data and method
 */
export const calculateUserAmount = (
  userData: UserSplitData, 
  splitMethod: string, 
  totalAmount: number, 
  activeUserCount: number,
  totalShares: number
): number => {
  // If user is not active, return 0
  if (userData.isActive === false) return 0;
  
  switch (splitMethod) {
    case "equal":
      return activeUserCount > 0 ? calculateEqualSplit(totalAmount, activeUserCount) : 0;
    case "percentage":
      return parseFloat(((userData.percentage || 0) * totalAmount / 100).toFixed(2));
    case "shares": {
      if (totalShares === 0) return 0;
      return parseFloat(((userData.shares || 0) / totalShares * totalAmount).toFixed(2));
    }
    default:
      return userData.amount || 0;
  }
};

/**
 * Validate if the current split data is valid based on the method
 */
export const validateSplitData = (
  data: UserSplitData[], 
  method: string, 
  totalAmount: number
): { isValid: boolean; errorMessage: string | null } => {
  if (!totalAmount || totalAmount <= 0) {
    return { 
      isValid: false, 
      errorMessage: "Please enter a valid total amount" 
    };
  }

  if (data.length === 0) {
    return { 
      isValid: false, 
      errorMessage: "No participants selected" 
    };
  }

  // Only consider active users for validation
  const activeData = data.filter(item => item.isActive !== false);
  
  if (activeData.length === 0) {
    return { 
      isValid: false, 
      errorMessage: "No active participants selected" 
    };
  }

  if (method === "amount") {
    const total = activeData.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    if (Math.abs(total - totalAmount) > 0.01) {
      return { 
        isValid: false,
        errorMessage: `Total must equal ${totalAmount.toFixed(2)}. Current total: ${total.toFixed(2)}` 
      };
    }
  } else if (method === "percentage") {
    const total = activeData.reduce((sum, item) => sum + (item.percentage || 0), 0);
    
    if (Math.abs(total - 100) > 0.01) {
      return { 
        isValid: false,
        errorMessage: `Percentages must sum to 100%. Current total: ${total.toFixed(1)}%` 
      };
    }
  }

  return { isValid: true, errorMessage: null };
};

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
 * Get user display name with proper fallback logic
 */
export const getUserDisplayName = (userData: UserSplitData): string => {
  // First priority: display_name
  if (userData.display_name) return userData.display_name;
  
  // Second priority: email prefix
  if (userData.email) return userData.email.split('@')[0];
  
  // Third priority: name
  if (userData.name) return userData.name;
  
  // Last resort: truncated user ID
  return userData.userId.substring(0, 8) + '...';
};

/**
 * Calculate the total shares from active users
 */
export const calculateTotalShares = (splitData: UserSplitData[]): number => {
  return splitData
    .filter(item => item.isActive !== false)
    .reduce((sum, item) => sum + (item.shares || 0), 0);
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
