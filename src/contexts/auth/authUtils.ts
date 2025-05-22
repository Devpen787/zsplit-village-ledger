
import { clearAuthState } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

/**
 * Helper function to validate user roles
 */
export const isValidRole = (role: string): boolean => {
  const validRoles = ['admin', 'participant', 'organizer'];
  return validRoles.includes(role);
};

/**
 * Perform a clean sign out, removing all auth state
 */
export const performSignOut = async (logoutFn: () => Promise<void>): Promise<void> => {
  try {
    clearAuthState(); // Clean up Supabase auth state
    await logoutFn();
    toast.success("Successfully signed out");
    return Promise.resolve();
  } catch (error) {
    console.error("Error signing out:", error);
    toast.error("Failed to sign out");
    throw error;
  }
};

/**
 * Extract email from Privy user
 */
export const getPrivyEmail = (privyUserObj: any): string | null => {
  if (!privyUserObj) return null;
  
  const linkedAccounts = privyUserObj.linkedAccounts || [];
  const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
  return emailAccount ? (emailAccount as any).address || null : null;
};
