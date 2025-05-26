
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
      console.log("Attempting to fetch user with ID:", privyUserId);
      
      // Validate Privy user ID format
      if (!validatePrivyUserId(privyUserId)) {
        console.error("Invalid Privy user ID format:", privyUserId);
        setAuthError("Invalid user ID format");
        return null;
      }
      
      // Set Supabase auth with the validated Privy user ID
      await setSupabaseAuth(privyUserId);
      
      // Using maybeSingle() to handle case where user might not exist yet
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', privyUserId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        
        // Handle specific RLS errors more gracefully
        if (fetchError.message?.includes('row-level security')) {
          setAuthError("Access denied: User not found or insufficient permissions");
        } else {
          setAuthError(`Database error: ${fetchError.message}`);
        }
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

  // Create a user using the secure Edge Function
  const createUser = useCallback(async (privyUserId: string, privyUser: any): Promise<User | null> => {
    try {
      console.log("Attempting to create new user with ID:", privyUserId);
      
      // Validate Privy user ID format
      if (!validatePrivyUserId(privyUserId)) {
        console.error("Invalid Privy user ID format:", privyUserId);
        setAuthError("Invalid user ID format");
        return null;
      }

      // If privyUser contains a token, validate it
      if (privyUser.token) {
        const tokenValidation = validatePrivyToken(privyUser.token);
        if (!tokenValidation.isValid) {
          console.error("Invalid Privy token:", tokenValidation.error);
          setAuthError(`Token validation failed: ${tokenValidation.error}`);
          return null;
        }
        console.log("Privy token validated successfully");
      }
      
      // Get email from Privy user
      const email = getPrivyEmail(privyUser);
      
      if (!email) {
        console.error("No email found in Privy user data");
        setAuthError("Could not create user: No email available");
        return null;
      }
      
      // First set up Supabase auth with the validated Privy user ID for future operations
      await setSupabaseAuth(privyUserId);
      
      // Prepare user data
      const userData = {
        user_id: privyUserId,
        user_email: email,
        user_name: privyUser.name || null,
        user_role: 'participant' // Default role
      };
      
      console.log("Creating user with data:", userData);
      
      // Use the secure Edge Function to create the user
      const insertedUser = await createUserSecurely(userData);
      
      if (!insertedUser) {
        console.error("No user data returned after insert");
        setAuthError("Failed to create your profile. No data returned.");
        return null;
      }
      
      console.log("User created successfully:", insertedUser);
      return insertedUser as User;
    } catch (error: any) {
      console.error("Error in createUser:", error);
      
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
    clearAuthError: () => setAuthError(null)
  };
};
