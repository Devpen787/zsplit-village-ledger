
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { setSupabaseAuth, clearAuthState } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { toast } from '@/components/ui/sonner';
import { useUserData } from './useUserData';
import { performSignOut, getPrivyEmail } from './authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth state machine states
type AuthState = 'initializing' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [authState, setAuthState] = useState<AuthState>('initializing');
  
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const { fetchUser, createUser, authError, clearAuthError, setAuthError } = useUserData();
  
  // Refs to prevent race conditions
  const isProcessingRef = useRef(false);
  const lastPrivyIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Reset login attempts counter
  const resetLoginAttempts = useCallback(() => {
    setLoginAttempts(0);
  }, []);

  // Centralized user refresh with race condition protection
  const refreshUser = useCallback(async (): Promise<User | null> => {
    // Prevent concurrent refresh calls
    if (isProcessingRef.current || !mountedRef.current) {
      return user;
    }

    if (!authenticated || !privyUser) {
      if (mountedRef.current) {
        setAuthState('unauthenticated');
        setUser(null);
        setLoading(false);
      }
      return null;
    }

    // Skip if same user and already processing
    if (lastPrivyIdRef.current === privyUser.id && user) {
      return user;
    }

    isProcessingRef.current = true;
    lastPrivyIdRef.current = privyUser.id;

    try {
      if (mountedRef.current) {
        setAuthState('loading');
        setLoading(true);
        clearAuthError();
      }

      // Set up Supabase auth
      await setSupabaseAuth(privyUser.id);
      
      // Fetch or create user
      let userData = await fetchUser(privyUser.id);
      
      if (!userData) {
        userData = await createUser(privyUser.id, privyUser);
      }

      if (userData && mountedRef.current) {
        setUser(userData);
        setAuthState('authenticated');
        resetLoginAttempts();
      } else {
        throw new Error('Failed to load user data');
      }

      return userData;
    } catch (error: any) {
      console.error('Auth refresh error:', error);
      
      if (mountedRef.current) {
        setAuthState('error');
        setAuthError(`Authentication failed: ${error?.message || 'Unknown error'}`);
        setLoginAttempts(prev => prev + 1);
      }
      
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isProcessingRef.current = false;
    }
  }, [authenticated, privyUser, fetchUser, createUser, clearAuthError, setAuthError, resetLoginAttempts, user]);

  // Single effect to manage auth state
  useEffect(() => {
    if (!ready) return;

    // Handle auth state changes
    const handleAuthChange = async () => {
      if (authenticated && privyUser) {
        // Only refresh if user ID changed or we don't have a user
        if (lastPrivyIdRef.current !== privyUser.id || !user) {
          await refreshUser();
        }
      } else {
        // Clear auth state
        if (mountedRef.current) {
          clearAuthState();
          setUser(null);
          setAuthState('unauthenticated');
          setLoading(false);
          lastPrivyIdRef.current = null;
        }
      }
    };

    // Debounce auth changes to prevent rapid fire calls
    const timeoutId = setTimeout(handleAuthChange, 100);
    
    return () => clearTimeout(timeoutId);
  }, [ready, authenticated, privyUser, refreshUser, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      clearAuthError();
      await performSignOut(logout);
      
      if (mountedRef.current) {
        setUser(null);
        setAuthState('unauthenticated');
        resetLoginAttempts();
        lastPrivyIdRef.current = null;
      }
    } catch (error) {
      console.error("Error in signOut:", error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const isAuthenticated = authState === 'authenticated' && !!user;

  const value: AuthContextType = {
    user,
    loading: authState === 'loading' || authState === 'initializing' || loading,
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
