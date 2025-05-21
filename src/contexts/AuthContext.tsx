
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { usePrivy } from '@privy-io/react-auth';
import { User, AuthContextType } from '@/types/auth';
import { createOrUpdateUserProfile, isValidRole } from '@/utils/authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const privy = usePrivy();

  const refreshUser = async (): Promise<User | null> => {
    if (!privy.user) {
      setUser(null);
      return null;
    }

    try {
      console.log('Refreshing user with Privy ID:', privy.user.id);
      const updatedUser = await createOrUpdateUserProfile(privy.user);
      
      if (updatedUser) {
        console.log('User profile updated:', updatedUser);
        setUser(updatedUser);
        return updatedUser;
      } else {
        console.log('Failed to update user profile');
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Effect to handle Privy auth changes
  useEffect(() => {
    const syncUserWithPrivy = async () => {
      if (!privy.ready) return;
      
      try {
        if (privy.authenticated && privy.user) {
          console.log('Privy authenticated, syncing user profile');
          await refreshUser();
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error syncing with Privy:', error);
      } finally {
        setLoading(false);
      }
    };
    
    syncUserWithPrivy();
  }, [privy.ready, privy.authenticated, privy.user]);

  const signOut = async () => {
    try {
      await privy.logout();
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
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
      loading: loading || !privy.ready,
      signOut,
      isAuthenticated: !!privy.authenticated,
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

// Export isValidRole for backward compatibility
export { isValidRole };
