import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase, setSupabaseAuth, clearAuthState } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { toast } from '@/components/ui/sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const isInitialized = useRef(false);
  
  // Reset login attempts counter
  const resetLoginAttempts = useCallback(() => {
    setLoginAttempts(0);
  }, []);

  // Clear auth errors
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Function to fetch a user from Supabase
  const fetchUser = useCallback(async (privyUserId: string): Promise<User | null> => {
    try {
      console.log("Attempting to fetch user with ID:", privyUserId);
      
      // Using maybeSingle() to handle case where user might not exist yet
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
  }, []);

  // Create a user directly in the database
  const createUser = useCallback(async (privyUserId: string, email: string | null): Promise<User | null> => {
    try {
      console.log("Attempting to create new user with ID:", privyUserId);
      
      // First set up Supabase auth with the Privy user ID
      await setSupabaseAuth(privyUserId);
      
      // Create a new user
      const newUser: User = {
        id: privyUserId,
        email: email || null,
        role: 'participant', // Default role
      };
      
      console.log("Creating user with data:", newUser);
      
      // Attempt direct insert with explicit auth workaround
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .upsert(newUser, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .maybeSingle();
      
      if (insertError) {
        console.error("Error creating user:", insertError);
        
        // Log the full error details for debugging
        console.log("Error code:", insertError.code);
        console.log("Error message:", insertError.message);
        console.log("Error details:", insertError.details);
        
        // Try a direct insert as a fallback 
        // (relies on RLS policy allowing anon inserts)
        if (insertError.message.includes('row-level security policy')) {
          console.log("Attempting fallback insert method...");
          
          const { data: fallbackUser, error: fallbackError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .maybeSingle();
            
          if (fallbackError) {
            console.error("Fallback insert also failed:", fallbackError);
            setAuthError(`Could not create your profile: ${fallbackError.message}`);
            return null;
          }
          
          if (fallbackUser) {
            console.log("Fallback insert succeeded:", fallbackUser);
            return fallbackUser as User;
          }
          
          setAuthError("Failed to create your profile. No data returned.");
          return null;
        } else {
          setAuthError(`Could not create user profile: ${insertError.message}`);
          return null;
        }
      }
      
      if (!insertedUser) {
        console.error("No user data returned after insert");
        setAuthError("Failed to create your profile. No data returned.");
        return null;
      }
      
      console.log("User created or updated successfully:", insertedUser);
      return insertedUser as User;
    } catch (error: any) {
      console.error("Error in createUser:", error);
      setAuthError(`Failed to create your profile: ${error?.message || 'Unknown error'}`);
      return null;
    }
  }, []);

  // Get email from Privy user
  const getPrivyEmail = useCallback((privyUserObj: any): string | null => {
    if (!privyUserObj) return null;
    
    // Get the user's email from Privy
    const linkedAccounts = privyUserObj.linkedAccounts || [];
    const emailAccount = linkedAccounts.find((account: any) => account.type === 'email');
    return emailAccount ? (emailAccount as any).address || null : null;
  }, []);

  // Refresh user data with improved error handling and retry logic
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
      // Get email from Privy
      const email = getPrivyEmail(privyUser);
      
      console.log("Refreshing user profile for Privy ID:", privyUser.id, "Email:", email);
      
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
        resetLoginAttempts(); // Reset login attempts on successful login
        return userData;
      } else {
        console.error("Failed to get or create user");
        setLoading(false);
        // Track failed attempts
        setLoginAttempts(prev => prev + 1);
        return null;
      }
    } catch (error: any) {
      console.error("Error refreshing user:", error);
      setLoading(false);
      setAuthError(`Failed to load your profile: ${error?.message || 'Unknown error'}`);
      // Track failed attempts
      setLoginAttempts(prev => prev + 1);
      return null;
    }
  }, [authenticated, privyUser, clearAuthError, fetchUser, createUser, getPrivyEmail, resetLoginAttempts]);

  // Initialize auth on component mount
  useEffect(() => {
    if (isInitialized.current || !ready) return;
    
    isInitialized.current = true;
    
    // If authenticated, attempt to refresh user data
    if (authenticated && privyUser) {
      refreshUser().catch(err => {
        console.error("Error during initial user refresh:", err);
      });
    } else {
      // Not authenticated, clear user state
      setUser(null);
      setLoading(false);
    }
  }, [ready, authenticated, privyUser, refreshUser]);

  // Watch for auth state changes
  useEffect(() => {
    // Only respond to changes if already initialized
    if (!isInitialized.current) return;
    
    if (authenticated && privyUser) {
      // Use a timeout to prevent rapid consecutive calls
      const timeoutId = setTimeout(() => {
        refreshUser().catch(err => {
          console.error("Error during user refresh after auth change:", err);
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (!authenticated) {
      // Clear user state when no longer authenticated
      setUser(null);
      setLoading(false);
    }
  }, [authenticated, privyUser, refreshUser]);

  const signOut = async () => {
    try {
      setLoading(true);
      clearAuthError();
      clearAuthState(); // Clean up Supabase auth state
      await logout();
      setUser(null);
      resetLoginAttempts();
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

export const isValidRole = (role: string): boolean => {
  const validRoles = ['admin', 'participant', 'organizer'];
  return validRoles.includes(role);
};
