
import { ExpenseUser } from "@/types/expenses";

/**
 * Format user name for display, using display_name, name, or email
 */
export const formatUserName = (user: ExpenseUser | null): string => {
  if (!user) return "Unknown User";
  return user.display_name || user.name || user.email || "Unknown User";
};

/**
 * Get user's display name (alias to formatUserName for compatibility)
 */
export const getUserDisplayName = (user: ExpenseUser | { userId: string; name?: string; email?: string; display_name?: string } | null): string => {
  if (!user) return "Unknown User";
  
  // Handle both ExpenseUser and UserSplitData formats
  if ('userId' in user) {
    return user.display_name || user.name || user.email || "Unknown User";
  }
  
  return formatUserName(user);
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (name: string): string => {
  if (!name || name === "Unknown User") return "?";
  
  const names = name.split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Format user name from split data (compatible with UserSplitData format)
 */
export const formatSplitDataUserName = (user: { userId: string; name?: string | null; email?: string | null; display_name?: string | null } | null): string => {
  if (!user) return "Unknown User";
  return user.display_name || user.name || user.email || "Unknown User";
};

