
import { UserSplitData } from "@/types/expenses";

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
