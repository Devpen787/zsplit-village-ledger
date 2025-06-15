
import { useState, useCallback } from 'react';
import { User } from '@/types/auth';
import { supabase, setSupabaseAuth, createUserSecurely } from '@/integrations/supabase/client';
import { getPrivyEmail } from './authUtils';
import { validatePrivyToken, validatePrivyUserId } from '@/utils/privyTokenValidation';

/**
 * Hook to handle fetching and creating user data with enhanced security
 */
export const useUserData = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Function to fetch a user from Supabase
  const fetchUser = useCallback(async (privyUserId: string): Promise<User | null> => {
    try {
      console.log("[USER DATA] Attempting to fetch user with ID:", privyUserId);
      
      // Validate Privy user ID format
      if (!validatePrivyUserId(privyUserId)) {
        console.error("[USER DATA] Invalid Privy user ID format:", privyUserId);
        setAuthError("Invalid user ID format");
        return null;
      }
      
      // Set Supabase auth context for RLS
      console.log("[USER DATA] Setting Supabase auth context");
      await setSupabaseAuth(privyUserId);
      
      // Try to fetch the user - this should work with RLS if user exists
      console.log("[USER DATA] Fetching user from Supabase");
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', privyUserId)
        .maybeSingle();

      if (fetchError) {
        console.error("[USER DATA] Error fetching user:", fetchError);
        // RLS might block this if user doesn't exist yet, which is expected
        return null;
      }

      if (existingUser) {
        console.log("[USER DATA] User found in database:", existingUser.id);
        return existingUser as User;
      }

      console.log("[USER DATA] User not found in database");
      return null;
    } catch (error) {
      console.error("[USER DATA] Error in fetchUser:", error);
      setAuthError("Unexpected error while fetching user profile");
      return null;
    }
  }, []);

  // Create a user using the secure Edge Function
  const createUser = useCallback(async (privyUserId: string, privyUser: any): Promise<User | null> => {
    try {
      console.log("[USER DATA] Attempting to create new user with ID:", privyUserId);
      
      // Validate Privy user ID format
      if (!validatePrivyUserId(privyUserId)) {
        console.error("[USER DATA] Invalid Privy user ID format:", privyUserId);
        setAuthError("Invalid user ID format");
        return null;
      }

      // If privyUser contains a token, validate it
      if (privyUser.token) {
        const tokenValidation = validatePrivyToken(privyUser.token);
        if (!tokenValidation.isValid) {
          console.error("[USER DATA] Invalid Privy token:", tokenValidation.error);
          setAuthError(`Token validation failed: ${tokenValidation.error}`);
          return null;
        }
        console.log("[USER DATA] Privy token validated successfully");
      }
      
      // Get email from Privy user
      const email = getPrivyEmail(privyUser);
      
      if (!email) {
        console.error("[USER DATA] No email found in Privy user data");
        setAuthError("Could not create user: No email available");
        return null;
      }
      
      // Prepare user data
      const userData = {
        user_id: privyUserId,
        user_email: email,
        user_name: privyUser.name || null,
        user_role: 'participant' // Default role
      };
      
      console.log("[USER DATA] Creating user with data:", userData);
      
      // Use the secure Edge Function to create the user (bypasses RLS)
      const insertedUser = await createUserSecurely(userData);
      
      if (!insertedUser) {
        console.error("[USER DATA] No user data returned after insert");
        setAuthError("Failed to create your profile. No data returned.");
        return null;
      }
      
      // Set up auth context after user creation
      console.log("[USER DATA] Setting up auth context after user creation");
      await setSupabaseAuth(privyUserId);
      
      console.log("[USER DATA] User created successfully:", insertedUser.id);
      return insertedUser as User;
    } catch (error: any) {
      console.error("[USER DATA] Error in createUser:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('Failed to create user')) {
        setAuthError(error.message);
      } else if (error.message?.includes('row-level security')) {
        setAuthError("Permission denied: Unable to create user profile");
      } else {
        setAuthError(`Failed to create your profile: ${error?.message || 'Unknown error'}`);
      }
      return null;
    }
  }, []);
  
  return {
    fetchUser,
    createUser,
    authError,
    setAuthError,
    clearAuthError: () => {
      console.log("[USER DATA] Clearing auth error");
      setAuthError(null);
    }
  };
};
