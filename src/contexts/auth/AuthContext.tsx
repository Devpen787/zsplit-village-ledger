
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { setSupabaseAuth, clearAuthState } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { useUserData } from './useUserData';
import { performSignOut } from './authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const { fetchUser, createUser, authError, clearAuthError, setAuthError } = useUserData();

  console.log('[AUTH CONTEXT] Current state:', {
    ready,
    authenticated,
    privyUserId: privyUser?.id,
    userInState: user?.id,
    loading,
    loginAttempts,
    authError
  });

  // Reset login attempts counter
  const resetLoginAttempts = useCallback(() => {
    console.log('[AUTH] Resetting login attempts');
    setLoginAttempts(0);
  }, []);

  // Main auth effect - simplified with more logging
  useEffect(() => {
    const handleAuth = async () => {
      console.log('[AUTH] Starting auth check', { 
        ready, 
        authenticated, 
        privyUserId: privyUser?.id,
        privyUserEmail: privyUser?.email?.address 
      });
      
      if (!ready) {
        console.log('[AUTH] Privy not ready yet, waiting...');
        return;
      }

      if (!authenticated || !privyUser) {
        console.log('[AUTH] Not authenticated, clearing state and stopping loading');
        clearAuthState();
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log('[AUTH] User is authenticated, setting up Supabase auth');
        setLoading(true);
        clearAuthError();

        // Set up Supabase auth
        console.log('[AUTH] Setting up Supabase auth for user:', privyUser.id);
        const authSuccess = await setSupabaseAuth(privyUser.id);
        if (!authSuccess) {
          throw new Error('Failed to set up Supabase authentication');
        }
        console.log('[AUTH] Supabase auth setup successful');

        // Fetch or create user
        console.log('[AUTH] Fetching user data from Supabase');
        let userData = await fetchUser(privyUser.id);
        if (!userData) {
          console.log('[AUTH] User not found, creating new user');
          userData = await createUser(privyUser.id, privyUser);
        } else {
          console.log('[AUTH] Existing user found:', userData.id);
        }

        if (userData) {
          console.log('[AUTH] User data loaded successfully:', userData.id);
          setUser(userData);
          resetLoginAttempts();
        } else {
          throw new Error('Failed to load user data after creation/fetch');
        }
      } catch (error: any) {
        console.error('[AUTH] Error in auth setup:', error);
        console.error('[AUTH] Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details
        });
        setAuthError(`Authentication failed: ${error?.message || 'Unknown error'}`);
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          console.log('[AUTH] Login attempt failed, count:', newAttempts);
          return newAttempts;
        });
      } finally {
        console.log('[AUTH] Setting loading to false');
        setLoading(false);
      }
    };

    handleAuth();
  }, [ready, authenticated, privyUser?.id, fetchUser, createUser, clearAuthError, setAuthError, resetLoginAttempts]);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    console.log('[AUTH] Refreshing user data');
    if (!authenticated || !privyUser) {
      console.log('[AUTH] Cannot refresh - not authenticated');
      return null;
    }
    
    try {
      const userData = await fetchUser(privyUser.id);
      if (userData) {
        console.log('[AUTH] User refreshed successfully');
        setUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('[AUTH] Error refreshing user:', error);
    }
    return null;
  }, [authenticated, privyUser, fetchUser]);

  const signOut = async () => {
    try {
      console.log('[AUTH] Starting sign out process');
      setLoading(true);
      clearAuthError();
      await performSignOut(logout);
      setUser(null);
      resetLoginAttempts();
      console.log('[AUTH] Sign out completed');
    } catch (error) {
      console.error('[AUTH] Error in signOut:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const isAuthenticated = authenticated && !!user;

  console.log('[AUTH] Final state check:', {
    ready,
    authenticated,
    user: user?.id,
    loading,
    isAuthenticated,
    authError
  });

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
