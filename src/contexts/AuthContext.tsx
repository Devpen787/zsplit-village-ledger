
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { cleanupAuthState } from '@/utils/authUtils';

type User = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  group_name?: string | null;
  wallet_address?: string | null;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        return;
      }

      // Fetch user profile from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }

      if (!userData) {
        console.warn('User authenticated but profile not found in users table');
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email!,
        name: userData.name,
        role: userData.role,
        group_name: userData.group_name,
        wallet_address: userData.wallet_address
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your profile');
    }
  };

  // Handle URL changes to check for auth redirects
  useEffect(() => {
    // Check if we've redirected from auth flow
    if (location.hash && location.hash.includes('access_token')) {
      // Allow Supabase auth client to process the URL
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // We have a session, force refresh the user data
          setTimeout(() => {
            refreshUser();
          }, 0);
        }
      });
    }
  }, [location]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/signup');
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlocks
          setTimeout(() => {
            refreshUser();
          }, 0);
        } else if (event === 'USER_UPDATED' && session?.user) {
          // Handle user updates
          setTimeout(() => {
            refreshUser();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      
      // Force page reload to ensure clean state
      window.location.href = '/signup';
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signOut,
      isAuthenticated: !!user,
      hasRole,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
