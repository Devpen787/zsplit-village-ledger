
import { ExpenseUser } from "@/types/expenses";

/**
 * Format user display name with consistent fallback logic
 */
export const formatUserName = (user: ExpenseUser | null | undefined): string => {
  if (!user) return "Unknown";
  
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

/**
 * Get user display name - convenience function that calls formatUserName
 * This function is used in useExpenseSplit and other components
 */
export const getUserDisplayName = (user: ExpenseUser | null | undefined): string => {
  return formatUserName(user);
};

/**
 * Format UserSplitData to display name
 * This adapts UserSplitData to work with components expecting a user display name
 */
export const formatSplitDataUserName = (userData: any): string => {
  // Check if userData has user properties directly
  if (userData.display_name || userData.email || userData.name || userData.id) {
    return formatUserName(userData);
  }
  
  // If it's something else, return a fallback
  return "Unknown User";
};

/**
 * Get user initials from their name
 */
export const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
