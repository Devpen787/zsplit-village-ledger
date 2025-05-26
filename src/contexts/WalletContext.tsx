
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth/AuthContext';
import { toast } from '@/components/ui/sonner';
import { initializeWeb3Modal } from '@/utils/walletConfig';

// Initialize web3modal during app startup
const web3modal = initializeWeb3Modal();

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
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { isLoading: isConnectLoading } = useConnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  
  // Shorten wallet address for display
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Handle connecting wallet
  const connect = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in before connecting your wallet");
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Open Web3Modal directly
      await web3modal.open();
    } catch (error) {
      console.error('Error opening Web3Modal:', error);
      setIsConnecting(false);
      toast.error("Failed to open wallet connection dialog");
    }
  }, [user]);
  
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
        setSavedAddress(null);
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
      
      if (wagmiIsConnected && wagmiAddress && user) {
        // Check if address is different from what we already saved
        if (user.wallet_address !== wagmiAddress && savedAddress !== wagmiAddress) {
          try {
            console.log("Saving wallet address to database:", wagmiAddress);
            const { error } = await supabase
              .from('users')
              .update({ wallet_address: wagmiAddress })
              .eq('id', user.id);
              
            if (error) {
              console.error("Error saving wallet address:", error);
              toast.error("Failed to save wallet address");
              throw error;
            }
            
            // Set saved address to avoid duplicate saves
            setSavedAddress(wagmiAddress);
            
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
  }, [wagmiIsConnected, wagmiAddress, user, refreshUser, savedAddress]);
  
  // When component mounts, initialize the saved address from the user object
  useEffect(() => {
    if (user?.wallet_address) {
      setSavedAddress(user.wallet_address);
    } else {
      setSavedAddress(null);
    }
  }, [user]);
  
  // Use live wagmi connection state for isConnected and address
  const currentAddress = wagmiIsConnected ? wagmiAddress : user?.wallet_address;
  const currentIsConnected = wagmiIsConnected || !!user?.wallet_address;
  
  return (
    <WalletContext.Provider 
      value={{
        address: currentAddress || null,
        isConnected: currentIsConnected,
        isConnecting: isConnecting || isConnectLoading,
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
