import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { toast } from '@/components/ui/sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { ready, authenticated, user: privyUser, logout } = usePrivy();

  // Function to fetch a user from Supabase
  const fetchUser = async (privyUserId: string): Promise<User | null> => {
    try {
      console.log("Attempting to fetch user with ID:", privyUserId);
      
      // Fetch the user using maybeSingle() to avoid errors if not found
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', privyUserId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        return null;
      }

      if (existingUser) {
        console.log("User found in database:", existingUser);
        return existingUser as User;
      }

      console.log("User not found in database");
      return null;
    } catch (error) {
      console.error("Error in fetchUser:", error);
      return null;
    }
  };

  // Function to create a user in Supabase
  const createUser = async (privyUserId: string, email: string | null): Promise<User | null> => {
    try {
      console.log("Attempting to create new user with ID:", privyUserId);
      
      // Create a new user
      const newUser = {
        id: privyUserId,
        email: email || '',
        name: null,
        role: 'participant' // Default role
      };
      
      // Insert the new user into the database
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();
      
      if (insertError) {
        console.error("Error creating user:", insertError);
        if (insertError.code === '42501') {
          setAuthError("Permission denied. Please check if you have the correct permissions.");
        } else {
          setAuthError("Could not create user profile. Please try again later.");
        }
        return null;
      }
      
      console.log("New user created successfully:", insertedUser);
      return insertedUser as User;
    } catch (error) {
      console.error("Error in createUser:", error);
      return null;
    }
  };

  // Function to fetch or create a user in Supabase
  const fetchOrCreateUser = async (privyUserId: string, email: string | null): Promise<User | null> => {
    try {
      // First try to fetch the user
      const existingUser = await fetchUser(privyUserId);
      
      // If user exists, return it
      if (existingUser) {
        return existingUser;
      }

      // Otherwise create a new user
      return await createUser(privyUserId, email);
    } catch (error) {
      console.error("Error in fetchOrCreateUser:", error);
      return null;
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    if (!authenticated || !privyUser) {
      setAuthError(null);
      return null;
    }
    
    setAuthError(null);
    
    try {
      // Get the user's email from Privy
      const linkedAccounts = privyUser.linkedAccounts || [];
      const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
      const email = emailAccount ? (emailAccount as any).address || (emailAccount as any).email : null;
      
      console.log("Refreshing user profile for Privy ID:", privyUser.id);
      const userData = await fetchUser(privyUser.id);
      
      if (userData) {
        setUser(userData);
        return userData;
      } else {
        // Only attempt to create if not found
        const newUser = await createUser(privyUser.id, email);
        if (newUser) {
          setUser(newUser);
          return newUser;
        } else {
          setAuthError("Could not create or retrieve your profile. Check console for details.");
          return null;
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setAuthError("Failed to load your profile. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    // Set a flag to prevent infinite loops
    let isAuthenticated = false;
    
    const initAuth = async () => {
      if (!ready) return;
      
      if (!authenticated || !privyUser) {
        setUser(null);
        setLoading(false);
        setAuthError(null);
        return;
      }
      
      // Set the flag to indicate we're authenticated
      isAuthenticated = true;
      
      try {
        // Get the user's email from Privy
        const linkedAccounts = privyUser.linkedAccounts || [];
        const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
        const email = emailAccount ? (emailAccount as any).address || (emailAccount as any).email : null;
        
        // First try to fetch the user
        let userData = await fetchUser(privyUser.id);
        
        // If user doesn't exist, create it
        if (!userData) {
          userData = await createUser(privyUser.id, email);
        }
        
        if (userData) {
          setUser(userData);
          setAuthError(null);
        } else {
          // Only show the error if we're still authenticated
          // This prevents errors during logout
          if (isAuthenticated) {
            setAuthError("Could not create or retrieve your profile. Check console for details.");
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        if (isAuthenticated) {
          setAuthError("Authentication error. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    
    // Cleanup function to reset the flag
    return () => {
      isAuthenticated = false;
    };
  }, [ready, authenticated, privyUser]);

  const signOut = async () => {
    try {
      setAuthError(null);
      await logout();
      setUser(null);
      toast.success("Successfully signed out");
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
    refreshUser,
    authError
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
