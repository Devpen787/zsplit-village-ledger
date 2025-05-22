
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { setSupabaseAuth, clearAuthState } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { toast } from '@/components/ui/sonner';
import { useUserData } from './useUserData';
import { performSignOut, getPrivyEmail } from './authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const isInitialized = useRef(false);
  
  const { fetchUser, createUser, authError, clearAuthError, setAuthError } = useUserData();
  
  // Reset login attempts counter
  const resetLoginAttempts = useCallback(() => {
    setLoginAttempts(0);
  }, []);

  // Refresh user data with improved error handling and retry logic
  const refreshUser = useCallback(async (): Promise<User | null> => {
    console.log("refreshUser called, authenticated:", authenticated, "privyUser:", privyUser);
    
    if (!authenticated || !privyUser) {
      clearAuthError();
      setLoading(false);
      return null;
    }
    
    setLoading(true);
    clearAuthError();
    
    try {
      // First try to fetch the user
      let userData = await fetchUser(privyUser.id);
      
      // If user doesn't exist, create it
      if (!userData) {
        console.log("User not found, creating new user");
        userData = await createUser(privyUser.id, privyUser);
      }
      
      if (userData) {
        console.log("Setting user data:", userData);
        setUser(userData);
        setLoading(false);
        resetLoginAttempts(); // Reset login attempts on successful login
        return userData;
      } else {
        console.error("Failed to get or create user");
        setLoading(false);
        // Track failed attempts
        setLoginAttempts(prev => prev + 1);
        return null;
      }
    } catch (error: any) {
      console.error("Error refreshing user:", error);
      setLoading(false);
      setAuthError(`Failed to load your profile: ${error?.message || 'Unknown error'}`);
      // Track failed attempts
      setLoginAttempts(prev => prev + 1);
      return null;
    }
  }, [authenticated, privyUser, clearAuthError, fetchUser, createUser, resetLoginAttempts, setAuthError]);

  // Initialize auth on component mount
  useEffect(() => {
    if (isInitialized.current || !ready) return;
    
    isInitialized.current = true;
    
    // If authenticated, attempt to refresh user data
    if (authenticated && privyUser) {
      refreshUser().catch(err => {
        console.error("Error during initial user refresh:", err);
      });
    } else {
      // Not authenticated, clear user state
      setUser(null);
      setLoading(false);
    }
  }, [ready, authenticated, privyUser, refreshUser]);

  // Watch for auth state changes
  useEffect(() => {
    // Only respond to changes if already initialized
    if (!isInitialized.current) return;
    
    if (authenticated && privyUser) {
      // Use a timeout to prevent rapid consecutive calls
      const timeoutId = setTimeout(() => {
        refreshUser().catch(err => {
          console.error("Error during user refresh after auth change:", err);
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (!authenticated) {
      // Clear user state when no longer authenticated
      setUser(null);
      setLoading(false);
    }
  }, [authenticated, privyUser, refreshUser]);

  const signOut = async () => {
    try {
      setLoading(true);
      clearAuthError();
      await performSignOut(logout);
      setUser(null);
      resetLoginAttempts();
    } catch (error) {
      console.error("Error in signOut:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    isAuthenticated,
    hasRole,
    refreshUser,
    authError,
    clearAuthError,
    loginAttempts,
    resetLoginAttempts
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { isValidRole } from './authUtils';
