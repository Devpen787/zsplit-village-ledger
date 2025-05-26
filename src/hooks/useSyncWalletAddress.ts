
import { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';

export const useSyncWalletAddress = () => {
  const { user: privyUser, authenticated } = usePrivy();
  const { user: authUser, isAuthenticated } = useAuth();
  const syncAttemptedRef = useRef(false);
  
  useEffect(() => {
    const syncWalletAddress = async () => {
      // Only proceed if user is authenticated with both Privy and our auth system
      if (!authenticated || !isAuthenticated || !privyUser || !authUser) {
        return;
      }

      // Prevent multiple sync attempts for the same session
      if (syncAttemptedRef.current) {
        return;
      }

      try {
        // Get the wallet address from Privy
        const walletAddress = privyUser.wallet?.address;
        
        if (!walletAddress) {
          console.log('No wallet address found in Privy user data');
          return;
        }

        // Check current wallet address in Supabase
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('wallet_address')
          .eq('id', authUser.id)
          .single();

        if (fetchError) {
          console.error('Error fetching current wallet address:', fetchError);
          return;
        }

        // Check if the wallet address needs to be updated
        if (currentUser?.wallet_address === walletAddress) {
          console.log('Wallet address already synced:', walletAddress);
          syncAttemptedRef.current = true;
          return;
        }

        // Update the wallet address in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({ wallet_address: walletAddress })
          .eq('id', authUser.id);

        if (updateError) {
          console.error('Error updating wallet address:', updateError);
          return;
        }

        console.log('Successfully synced wallet address to Supabase:', walletAddress);
        syncAttemptedRef.current = true;

      } catch (error) {
        console.error('Unexpected error during wallet address sync:', error);
      }
    };

    // Reset sync attempt flag when user changes
    if (privyUser?.id) {
      syncAttemptedRef.current = false;
    }

    syncWalletAddress();
  }, [authenticated, isAuthenticated, privyUser, authUser]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!authenticated || !isAuthenticated) {
      syncAttemptedRef.current = false;
    }
  }, [authenticated, isAuthenticated]);
};
