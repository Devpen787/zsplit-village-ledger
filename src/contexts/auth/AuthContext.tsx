
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

  console.log('[AUTH CONTEXT] === DETAILED STATE ===');
  console.log('[AUTH CONTEXT] ready:', ready);
  console.log('[AUTH CONTEXT] authenticated:', authenticated);
  console.log('[AUTH CONTEXT] privyUser exists:', !!privyUser);
  console.log('[AUTH CONTEXT] privyUser.id:', privyUser?.id);
  console.log('[AUTH CONTEXT] privyUser.email:', privyUser?.email?.address);
  console.log('[AUTH CONTEXT] user in state:', user?.id);
  console.log('[AUTH CONTEXT] loading:', loading);
  console.log('[AUTH CONTEXT] loginAttempts:', loginAttempts);
  console.log('[AUTH CONTEXT] authError:', authError);
  console.log('[AUTH CONTEXT] ================================');

  // Reset login attempts counter
  const resetLoginAttempts = useCallback(() => {
    console.log('[AUTH] Resetting login attempts');
    setLoginAttempts(0);
  }, []);

  // Main auth effect
  useEffect(() => {
    const handleAuth = async () => {
      console.log('[AUTH] ====== STARTING AUTH HANDLER ======');
      console.log('[AUTH] ready:', ready);
      console.log('[AUTH] authenticated:', authenticated);
      console.log('[AUTH] privyUser:', privyUser?.id);
      
      if (!ready) {
        console.log('[AUTH] Privy not ready yet, keeping loading state');
        return;
      }

      if (!authenticated || !privyUser) {
        console.log('[AUTH] Not authenticated, clearing state');
        clearAuthState();
        setUser(null);
        setLoading(false);
        console.log('[AUTH] ====== AUTH HANDLER COMPLETE (NOT AUTHENTICATED) ======');
        return;
      }

      console.log('[AUTH] User is authenticated, proceeding with setup');
      
      try {
        setLoading(true);
        clearAuthError();

        console.log('[AUTH] Step 1: Setting up Supabase auth for user:', privyUser.id);
        const authSuccess = await setSupabaseAuth(privyUser.id);
        if (!authSuccess) {
          throw new Error('Failed to set up Supabase authentication');
        }
        console.log('[AUTH] Step 1: ✅ Supabase auth setup successful');

        console.log('[AUTH] Step 2: Attempting to fetch existing user');
        let userData = await fetchUser(privyUser.id);
        
        if (!userData) {
          console.log('[AUTH] Step 3: No existing user found, creating new user');
          userData = await createUser(privyUser.id, privyUser);
          console.log('[AUTH] Step 3: Create user result:', userData ? 'SUCCESS' : 'FAILED');
        } else {
          console.log('[AUTH] Step 2: ✅ Existing user found:', userData.id);
        }

        if (userData) {
          console.log('[AUTH] Step 4: ✅ Setting user data in state:', userData.id);
          setUser(userData);
          resetLoginAttempts();
          console.log('[AUTH] ====== AUTH HANDLER COMPLETE (SUCCESS) ======');
        } else {
          console.log('[AUTH] Step 4: ❌ No user data available after fetch/create');
          throw new Error('Failed to load user data after creation/fetch');
        }
      } catch (error: any) {
        console.error('[AUTH] ❌ Error in auth setup:', error);
        console.error('[AUTH] Error message:', error?.message);
        console.error('[AUTH] Error code:', error?.code);
        
        setAuthError(`Authentication failed: ${error?.message || 'Unknown error'}`);
        setLoginAttempts(prev => {
          const newAttempts = prev + 1;
          console.log('[AUTH] Login attempt failed, count:', newAttempts);
          return newAttempts;
        });
        console.log('[AUTH] ====== AUTH HANDLER COMPLETE (ERROR) ======');
      } finally {
        console.log('[AUTH] Setting loading to false');
        setLoading(false);
      }
    };

    console.log('[AUTH] Auth effect triggered, calling handleAuth');
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

  console.log('[AUTH] ==== FINAL CONTEXT STATE ====');
  console.log('[AUTH] isAuthenticated:', isAuthenticated);
  console.log('[AUTH] loading:', loading);
  console.log('[AUTH] user exists:', !!user);
  console.log('[AUTH] authError:', authError);
  console.log('[AUTH] ===============================');

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
