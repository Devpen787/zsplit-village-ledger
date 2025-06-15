
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

  // Reset login attempts counter
  const resetLoginAttempts = useCallback(() => {
    setLoginAttempts(0);
  }, []);

  // Main auth effect - simplified
  useEffect(() => {
    const handleAuth = async () => {
      console.log('[AUTH] Starting auth check', { ready, authenticated, privyUser: privyUser?.id });
      
      if (!ready) {
        console.log('[AUTH] Privy not ready yet');
        return;
      }

      if (!authenticated || !privyUser) {
        console.log('[AUTH] Not authenticated, clearing state');
        clearAuthState();
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log('[AUTH] User is authenticated, setting up Supabase');
        setLoading(true);
        clearAuthError();

        // Set up Supabase auth
        const authSuccess = await setSupabaseAuth(privyUser.id);
        if (!authSuccess) {
          throw new Error('Failed to set up Supabase authentication');
        }

        // Fetch or create user
        let userData = await fetchUser(privyUser.id);
        if (!userData) {
          console.log('[AUTH] Creating new user');
          userData = await createUser(privyUser.id, privyUser);
        }

        if (userData) {
          console.log('[AUTH] User data loaded:', userData.id);
          setUser(userData);
          resetLoginAttempts();
        } else {
          throw new Error('Failed to load user data');
        }
      } catch (error: any) {
        console.error('[AUTH] Error in auth setup:', error);
        setAuthError(`Authentication failed: ${error?.message || 'Unknown error'}`);
        setLoginAttempts(prev => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    handleAuth();
  }, [ready, authenticated, privyUser?.id, fetchUser, createUser, clearAuthError, setAuthError, resetLoginAttempts]);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!authenticated || !privyUser) return null;
    
    try {
      const userData = await fetchUser(privyUser.id);
      if (userData) {
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
      console.log('[AUTH] Signing out');
      setLoading(true);
      clearAuthError();
      await performSignOut(logout);
      setUser(null);
      resetLoginAttempts();
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

  console.log('[AUTH] Current state:', {
    ready,
    authenticated,
    user: user?.id,
    loading,
    isAuthenticated
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
