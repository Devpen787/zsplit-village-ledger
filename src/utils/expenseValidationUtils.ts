
import { UserSplitData } from "@/types/expenses";

/**
 * Validate split data based on the split method
 */
export const validateSplitData = (
  splitData: UserSplitData[],
  splitMethod: string,
  totalAmount: number
): { isValid: boolean; errorMessage: string | null } => {
  // Only consider active users for validation
  const activeUsers = splitData.filter(item => item.isActive !== false);
  
  if (activeUsers.length === 0) {
    return { 
      isValid: false, 
      errorMessage: "No participants selected" 
    };
  }
  
  switch (splitMethod) {
    case "equal":
      // Equal split is always valid as long as there are active users
      return { 
        isValid: true, 
        errorMessage: null 
      };
      
    case "amount": {
      const totalAssigned = activeUsers.reduce((sum, item) => sum + (item.amount || 0), 0);
      const diff = Math.abs(totalAmount - totalAssigned);
      
      if (diff > 0.01) {
        return {
          isValid: false,
          errorMessage: totalAssigned > totalAmount 
            ? `Amounts exceed total by ${diff.toFixed(2)}`
            : `${diff.toFixed(2)} remains to be assigned`
        };
      }
      return { 
        isValid: true, 
        errorMessage: null 
      };
    }
    
    case "percentage": {
      const totalPercentage = activeUsers.reduce((sum, item) => sum + (item.percentage || 0), 0);
      const diff = Math.abs(100 - totalPercentage);
      
      if (diff > 0.1) {
        return {
          isValid: false,
          errorMessage: totalPercentage > 100 
            ? `Percentages exceed 100% by ${diff.toFixed(1)}%`
            : `${diff.toFixed(1)}% remains to be assigned`
        };
      }
      return { 
        isValid: true, 
        errorMessage: null 
      };
    }
    
    default:
      return { 
        isValid: false, 
        errorMessage: "Unknown split method" 
      };
  }
};
