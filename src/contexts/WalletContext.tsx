
import React, { createContext, useState, useContext, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi';
import { wagmiConfig, projectId } from '@/utils/walletConfig';
import { useAccount, useDisconnect } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth/AuthContext';
import { toast } from '@/components/ui/sonner';

// Initialize web3modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  themeMode: 'light',
});

type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => Promise<void>;
  shortenAddress: (address: string) => string;
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: () => {},
  disconnect: async () => {},
  shortenAddress: () => '',
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Shorten wallet address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  // Handle connecting wallet
  const connect = () => {
    if (!user) {
      toast.error("Please sign in before connecting your wallet");
      return;
    }
    
    setIsConnecting(true);
    // Open web3modal
    document.dispatchEvent(new Event('wallet-connect'));
  };
  
  // Handle disconnecting wallet
  const disconnect = async () => {
    try {
      await wagmiDisconnect();
      
      // If user is authenticated, update their wallet address in Supabase
      if (user) {
        await supabase
          .from('users')
          .update({ wallet_address: null })
          .eq('id', user.id);
          
        // Refresh user data
        await refreshUser();
      }
      
      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };
  
  // Save wallet address to user profile when connected
  useEffect(() => {
    const saveWalletAddress = async () => {
      setIsConnecting(false);
      
      if (isConnected && address && user) {
        if (user.wallet_address !== address) {
          try {
            const { error } = await supabase
              .from('users')
              .update({ wallet_address: address })
              .eq('id', user.id);
              
            if (error) throw error;
            
            // Refresh user data
            await refreshUser();
            toast.success("Wallet connected successfully");
          } catch (error) {
            console.error("Error saving wallet address:", error);
            toast.error("Failed to save wallet address");
          }
        }
      }
    };
    
    saveWalletAddress();
  }, [isConnected, address, user, refreshUser]);
  
  return (
    <WalletContext.Provider 
      value={{
        address: user?.wallet_address || null,
        isConnected: !!user?.wallet_address,
        isConnecting,
        connect,
        disconnect,
        shortenAddress
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
