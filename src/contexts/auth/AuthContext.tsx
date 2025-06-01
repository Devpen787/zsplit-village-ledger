
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
    console.log('[AUTH CONTEXT] Starting refreshUser', {
      isProcessing: isProcessingRef.current,
      mounted: mountedRef.current,
      authenticated,
      privyUserId: privyUser?.id,
      lastPrivyId: lastPrivyIdRef.current
    });

    // Prevent concurrent refresh calls
    if (isProcessingRef.current || !mountedRef.current) {
      console.log('[AUTH CONTEXT] Skipping refresh - already processing or unmounted');
      return user;
    }

    if (!authenticated || !privyUser) {
      console.log('[AUTH CONTEXT] Not authenticated or no privy user');
      if (mountedRef.current) {
        setAuthState('unauthenticated');
        setUser(null);
        setLoading(false);
      }
      return null;
    }

    // Skip if same user and already processing
    if (lastPrivyIdRef.current === privyUser.id && user) {
      console.log('[AUTH CONTEXT] Same user, returning existing');
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

      console.log('[AUTH CONTEXT] Setting up Supabase auth for user:', privyUser.id);
      // Set up Supabase auth
      const authSuccess = await setSupabaseAuth(privyUser.id);
      console.log('[AUTH CONTEXT] Supabase auth setup result:', authSuccess);
      
      // Fetch or create user
      console.log('[AUTH CONTEXT] Fetching user data');
      let userData = await fetchUser(privyUser.id);
      
      if (!userData) {
        console.log('[AUTH CONTEXT] User not found, creating new user');
        userData = await createUser(privyUser.id, privyUser);
      }

      if (userData && mountedRef.current) {
        console.log('[AUTH CONTEXT] User data loaded successfully:', userData);
        setUser(userData);
        setAuthState('authenticated');
        resetLoginAttempts();
      } else {
        throw new Error('Failed to load user data');
      }

      return userData;
    } catch (error: any) {
      console.error('[AUTH CONTEXT] Auth refresh error:', error);
      
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
    if (!ready) {
      console.log('[AUTH CONTEXT] Privy not ready yet');
      return;
    }

    console.log('[AUTH CONTEXT] Auth state change detected:', {
      authenticated,
      privyUserId: privyUser?.id,
      currentUserId: user?.id
    });

    // Handle auth state changes
    const handleAuthChange = async () => {
      if (authenticated && privyUser) {
        // Only refresh if user ID changed or we don't have a user
        if (lastPrivyIdRef.current !== privyUser.id || !user) {
          console.log('[AUTH CONTEXT] Need to refresh user data');
          await refreshUser();
        } else {
          console.log('[AUTH CONTEXT] User already loaded, skipping refresh');
        }
      } else {
        // Clear auth state
        console.log('[AUTH CONTEXT] Clearing auth state');
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
      console.log('[AUTH CONTEXT] Starting sign out');
      setLoading(true);
      clearAuthError();
      await performSignOut(logout);
      
      if (mountedRef.current) {
        setUser(null);
        setAuthState('unauthenticated');
        resetLoginAttempts();
        lastPrivyIdRef.current = null;
      }
      console.log('[AUTH CONTEXT] Sign out completed');
    } catch (error) {
      console.error("[AUTH CONTEXT] Error in signOut:", error);
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

  console.log('[AUTH CONTEXT] Current auth state:', {
    authState,
    isAuthenticated,
    userId: user?.id,
    loading
  });

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
