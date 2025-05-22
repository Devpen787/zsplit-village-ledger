
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Clear auth errors
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Function to fetch a user from Supabase
  const fetchUser = async (privyUserId: string): Promise<User | null> => {
    try {
      console.log("Attempting to fetch user with ID:", privyUserId);
      
      // Add a small delay to ensure Supabase connection is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', privyUserId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        setAuthError(`Database error: ${fetchError.message}`);
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
      setAuthError("Unexpected error while fetching user profile");
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
        role: 'participant' // Default role
      };
      
      console.log("Creating user with data:", newUser);
      
      // Insert the new user into the database with upsert
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .upsert(newUser, { onConflict: 'id' })
        .select()
        .maybeSingle();
      
      if (insertError) {
        console.error("Error creating user:", insertError);
        if (insertError.code === '42501') {
          setAuthError("Permission denied. Please check if you have the correct permissions.");
        } else {
          setAuthError(`Could not create user profile: ${insertError.message}`);
        }
        return null;
      }
      
      console.log("User created or updated successfully:", insertedUser);
      return insertedUser as User;
    } catch (error) {
      console.error("Error in createUser:", error);
      setAuthError("Failed to create your profile. Please try again.");
      return null;
    }
  };

  const refreshUser = useCallback(async (): Promise<User | null> => {
    console.log("refreshUser called, authenticated:", authenticated, "privyUser:", privyUser);
    
    if (!authenticated || !privyUser) {
      clearAuthError();
      setLoading(false);
      return null;
    }
    
    setLoading(true);
    clearAuthError();
    
    try {
      // Get the user's email from Privy
      const linkedAccounts = privyUser.linkedAccounts || [];
      const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
      const email = emailAccount ? (emailAccount as any).address || (emailAccount as any).email : null;
      
      console.log("Refreshing user profile for Privy ID:", privyUser.id);
      
      // First try to fetch the user
      let userData = await fetchUser(privyUser.id);
      
      // If user doesn't exist, create it
      if (!userData) {
        console.log("User not found, creating new user");
        userData = await createUser(privyUser.id, email);
      }
      
      if (userData) {
        console.log("Setting user data:", userData);
        setUser(userData);
        setLoading(false);
        return userData;
      } else {
        console.error("Failed to get or create user");
        setLoading(false);
        // Only set auth error if we don't already have one (it would be set by createUser or fetchUser)
        if (!authError) {
          setAuthError("Unable to load your profile. Please try again.");
        }
        return null;
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setLoading(false);
      setAuthError("Failed to load your profile. Please try again.");
      return null;
    }
  }, [authenticated, privyUser, authError, clearAuthError]);

  useEffect(() => {
    // Set a flag to prevent infinite loops
    let isActive = true;
    
    const initAuth = async () => {
      if (!ready) {
        return;
      }
      
      setLoading(true);
      
      if (!authenticated || !privyUser) {
        setUser(null);
        setLoading(false);
        clearAuthError();
        return;
      }
      
      try {
        // Get the user's email from Privy
        const linkedAccounts = privyUser.linkedAccounts || [];
        const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
        const email = emailAccount ? (emailAccount as any).address || (emailAccount as any).email : null;
        
        // First try to fetch the user
        let userData = await fetchUser(privyUser.id);
        
        // If user doesn't exist, create it
        if (!userData && isActive) {
          userData = await createUser(privyUser.id, email);
        }
        
        if (userData && isActive) {
          setUser(userData);
          clearAuthError();
        } else if (isActive) {
          // Only set auth error if we don't already have one (it would be set by createUser or fetchUser)
          if (!authError) {
            setAuthError("Could not retrieve or create your profile. Please try again.");
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        if (isActive) {
          setAuthError("Authentication error. Please try again later.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    initAuth();
    
    // Cleanup function
    return () => {
      isActive = false;
    };
  }, [ready, authenticated, privyUser, clearAuthError, authError]);

  const signOut = async () => {
    try {
      setLoading(true);
      clearAuthError();
      await logout();
      setUser(null);
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
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
    authError,
    clearAuthError
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
