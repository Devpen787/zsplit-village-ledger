
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
  const refreshingRef = useRef(false); // Track if refresh is in progress
  const lastPrivyIdRef = useRef<string | null>(null); // Track last Privy user ID
  
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

    // Skip refresh if already in progress with same user
    if (refreshingRef.current && lastPrivyIdRef.current === privyUser.id) {
      console.log("Skipping duplicate refresh for same user");
      return user;
    }
    
    // Set refreshing state and track user
    refreshingRef.current = true;
    lastPrivyIdRef.current = privyUser.id;
    
    setLoading(true);
    clearAuthError();
    
    try {
      // First set up Supabase auth with the Privy user ID
      await setSupabaseAuth(privyUser.id);
      
      // Then try to fetch the user
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
    } finally {
      refreshingRef.current = false;
    }
  }, [authenticated, privyUser, clearAuthError, fetchUser, createUser, resetLoginAttempts, setAuthError, user]);

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
      // Skip refresh if user ID hasn't changed
      if (lastPrivyIdRef.current === privyUser.id && user) {
        console.log("Skipping auth change handler - same user ID");
        return;
      }
      
      // Debounce refresh calls with a small delay
      const timeoutId = setTimeout(() => {
        refreshUser().catch(err => {
          console.error("Error during user refresh after auth change:", err);
        });
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else if (!authenticated) {
      // Clear user state when no longer authenticated
      clearAuthState();
      setUser(null);
      setLoading(false);
      lastPrivyIdRef.current = null;
    }
  }, [authenticated, privyUser, refreshUser, user]);

  const signOut = async () => {
    try {
      setLoading(true);
      clearAuthError();
      await performSignOut(logout);
      setUser(null);
      resetLoginAttempts();
      lastPrivyIdRef.current = null; // Reset the stored Privy user ID
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
