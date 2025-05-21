
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { usePrivy } from '@privy-io/react-auth';

type User = {
  id: string;
  email: string | null;
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
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const isValidRole = (role: string): boolean => {
  const allowedRoles = ['participant', 'organizer', 'admin'];
  return allowedRoles.includes(role);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const privy = usePrivy();

  const createOrUpdateUserProfile = async (privyUser: any): Promise<User | null> => {
    if (!privyUser) return null;
    
    try {
      // Get email and wallet from privy user
      const email = privyUser.email?.address || null;
      const linkedAccounts = privyUser.linkedAccounts || [];
      const wallet = linkedAccounts.find((account: any) => account.type === 'wallet')?.address || null;
      
      // Check if user exists in our database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', privyUser.id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        return null;
      }

      if (existingUser) {
        // Update existing user if needed
        const updates: any = {};
        if (email && email !== existingUser.email) updates.email = email;
        if (wallet && wallet !== existingUser.wallet_address) updates.wallet_address = wallet;
        
        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', privyUser.id);
            
          if (updateError) {
            console.error('Error updating user:', updateError);
            toast.error('Failed to update your profile');
          }
        }
        
        return {
          id: existingUser.id,
          email: email || existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          group_name: existingUser.group_name,
          wallet_address: wallet || existingUser.wallet_address
        };
      } else {
        // Create new user
        const role = 'participant'; // Default role for new users
        
        const newUser = {
          id: privyUser.id,
          email: email,
          name: privyUser.displayName || null,
          role: role,
          group_name: null,
          wallet_address: wallet
        };
        
        const { error: insertError } = await supabase
          .from('users')
          .insert(newUser);
          
        if (insertError) {
          console.error('Error creating user:', insertError);
          toast.error('Failed to create your profile');
          return null;
        }
        
        return newUser;
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error);
      return null;
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    if (!privy.user) {
      setUser(null);
      return null;
    }

    try {
      const updatedUser = await createOrUpdateUserProfile(privy.user);
      
      if (updatedUser) {
        setUser(updatedUser);
        return updatedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Effect to handle Privy auth changes
  useEffect(() => {
    if (privy.ready) {
      setLoading(false);
      
      if (privy.authenticated && privy.user) {
        console.log('Privy authenticated, syncing user profile');
        refreshUser();
      } else {
        setUser(null);
      }
    }
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
      loading: loading || privy.loading,
      signOut,
      isAuthenticated: !!user && privy.authenticated,
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
