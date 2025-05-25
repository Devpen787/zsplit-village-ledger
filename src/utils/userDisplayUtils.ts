
/**
 * Utility functions for displaying user information consistently
 */

export const getUserDisplayName = (user: { name?: string | null; email?: string | null }): string => {
  return user.name || user.email || 'Unknown user';
};

export const shortenWalletAddress = (address: string | null | undefined): string | null => {
  if (!address) return null;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const getWalletDisplayInfo = (walletAddress: string | null | undefined) => {
  return {
    hasWallet: !!walletAddress,
    shortAddress: shortenWalletAddress(walletAddress),
    fullAddress: walletAddress
  };
};

export const formatUserWithWallet = (user: {
  name?: string | null;
  email?: string | null;
  wallet_address?: string | null;
}) => {
  return {
    displayName: getUserDisplayName(user),
    wallet: getWalletDisplayInfo(user.wallet_address)
  };
};
