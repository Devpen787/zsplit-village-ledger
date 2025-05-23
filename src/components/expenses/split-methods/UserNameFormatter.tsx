
import { ExpenseUser } from "@/types/expenses";

export const formatUserName = (user: ExpenseUser): string => {
  // First priority: display_name if available
  if (user.display_name) return user.display_name;
  
  // Second priority: use email prefix (before @)
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix;
  }
  
  // Third priority: use name if available
  if (user.name) return user.name;
  
  // Last resort: truncated user ID
  return user.id.substring(0, 8) + '...';
};
