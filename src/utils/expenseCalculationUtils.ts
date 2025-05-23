
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
  userData: {
    userId: string;
    amount?: number;
    percentage?: number;
    shares?: number;
    isActive?: boolean;
  }, 
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
 * Calculate the total shares from active users
 */
export const calculateTotalShares = (
  splitData: Array<{
    userId: string;
    shares?: number;
    isActive?: boolean;
  }>
): number => {
  return splitData
    .filter(item => item.isActive !== false)
    .reduce((sum, item) => sum + (item.shares || 0), 0);
};
