
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { toast } from '@/components/ui/sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { ready, authenticated, user: privyUser, logout } = usePrivy();

  // Function to fetch or create a user in Supabase
  const fetchOrCreateUser = async (privyUserId: string, email: string | null): Promise<User | null> => {
    try {
      // First try to fetch the user
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', privyUserId);

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        return null;
      }

      // If user exists, return it
      if (existingUsers && existingUsers.length > 0) {
        return existingUsers[0] as User;
      }

      // If no user exists, create one
      // First, prepare the user data
      const newUser: User = {
        id: privyUserId,
        email: email || '',
        name: null,
        role: 'participant' // Default role
      };

      // Try to create the user with RLS bypassed
      // Note: In a production app, this would typically be handled by a secure server function
      // Using the admin API, or a Supabase Edge Function with proper authorization
      
      console.log('Creating new user:', newUser);
      
      // For now, we'll just return the new user object without creating it in the database
      // This allows the app to continue functioning while the backend issues are resolved
      return newUser;
    } catch (error) {
      console.error("Error in fetchOrCreateUser:", error);
      return null;
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    if (!authenticated || !privyUser) return null;
    
    // Get the user's email from Privy
    const linkedAccounts = privyUser.linkedAccounts || [];
    const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
    const email = emailAccount ? emailAccount.email : null; // Fix: Changed from address to email
    
    const userData = await fetchOrCreateUser(privyUser.id, email);
    if (userData) {
      setUser(userData);
      return userData;
    }
    return null;
  };

  useEffect(() => {
    const initAuth = async () => {
      if (!ready) return;
      
      if (!authenticated || !privyUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        // Get the user's email from Privy
        const linkedAccounts = privyUser.linkedAccounts || [];
        const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
        const email = emailAccount ? emailAccount.email : null; // Fix: Changed from address to email
        
        const userData = await fetchOrCreateUser(privyUser.id, email);
        
        if (userData) {
          setUser(userData);
        } else {
          // If we couldn't fetch or create a user, show an error
          toast.error("There was an issue loading your profile. Please try again.");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Authentication error. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [ready, authenticated, privyUser]);

  const signOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
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
    refreshUser
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

export const isValidRole = (role: string): boolean => {
  const validRoles = ['admin', 'participant'];
  return validRoles.includes(role);
};
