
/**
 * Consolidated user utility functions for consistent user information display
 */

export interface UserLike {
  id?: string;
  userId?: string;
  name?: string | null;
  email?: string | null;
  display_name?: string | null;
  wallet_address?: string | null;
}

/**
 * Get user's display name with fallback logic
 */
export const getUserDisplayName = (user: UserLike | null): string => {
  if (!user) return "Unknown User";
  return user.display_name || user.name || user.email || "Unknown User";
};

/**
 * Get user initials for avatar display
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
 * Shorten wallet address for display
 */
export const shortenWalletAddress = (address: string | null | undefined): string | null => {
  if (!address) return null;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

/**
 * Get wallet display information
 */
export const getWalletDisplayInfo = (walletAddress: string | null | undefined) => {
  return {
    hasWallet: !!walletAddress,
    shortAddress: shortenWalletAddress(walletAddress),
    fullAddress: walletAddress
  };
};

/**
 * Format user with wallet information
 */
export const formatUserWithWallet = (user: UserLike) => {
  return {
    displayName: getUserDisplayName(user),
    wallet: getWalletDisplayInfo(user.wallet_address)
  };
};
