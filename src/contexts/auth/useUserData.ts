
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
      console.log("[USER DATA] ====== FETCH USER START ======");
      console.log("[USER DATA] privyUserId:", privyUserId);
      
      // Validate Privy user ID format
      if (!validatePrivyUserId(privyUserId)) {
        console.error("[USER DATA] ❌ Invalid Privy user ID format:", privyUserId);
        setAuthError("Invalid user ID format");
        return null;
      }
      console.log("[USER DATA] ✅ User ID validation passed");
      
      // Set Supabase auth context for RLS
      console.log("[USER DATA] Setting Supabase auth context");
      await setSupabaseAuth(privyUserId);
      console.log("[USER DATA] ✅ Supabase auth context set");
      
      // Try to fetch the user
      console.log("[USER DATA] Fetching user from Supabase database");
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', privyUserId)
        .maybeSingle();

      console.log("[USER DATA] Fetch result - data:", existingUser);
      console.log("[USER DATA] Fetch result - error:", fetchError);

      if (fetchError) {
        console.error("[USER DATA] ❌ Error fetching user:", fetchError);
        console.error("[USER DATA] Error details:", {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details
        });
        // RLS might block this if user doesn't exist yet, which is expected
        return null;
      }

      if (existingUser) {
        console.log("[USER DATA] ✅ User found in database:", existingUser.id);
        console.log("[USER DATA] User details:", {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role
        });
        console.log("[USER DATA] ====== FETCH USER SUCCESS ======");
        return existingUser as User;
      }

      console.log("[USER DATA] User not found in database");
      console.log("[USER DATA] ====== FETCH USER NOT FOUND ======");
      return null;
    } catch (error) {
      console.error("[USER DATA] ❌ Unexpected error in fetchUser:", error);
      setAuthError("Unexpected error while fetching user profile");
      console.log("[USER DATA] ====== FETCH USER ERROR ======");
      return null;
    }
  }, []);

  // Create a user using the secure Edge Function
  const createUser = useCallback(async (privyUserId: string, privyUser: any): Promise<User | null> => {
    try {
      console.log("[USER DATA] ====== CREATE USER START ======");
      console.log("[USER DATA] privyUserId:", privyUserId);
      console.log("[USER DATA] privyUser email:", privyUser?.email?.address);
      
      // Validate Privy user ID format
      if (!validatePrivyUserId(privyUserId)) {
        console.error("[USER DATA] ❌ Invalid Privy user ID format:", privyUserId);
        setAuthError("Invalid user ID format");
        return null;
      }
      console.log("[USER DATA] ✅ User ID validation passed");

      // If privyUser contains a token, validate it
      if (privyUser.token) {
        console.log("[USER DATA] Validating Privy token");
        const tokenValidation = validatePrivyToken(privyUser.token);
        if (!tokenValidation.isValid) {
          console.error("[USER DATA] ❌ Invalid Privy token:", tokenValidation.error);
          setAuthError(`Token validation failed: ${tokenValidation.error}`);
          return null;
        }
        console.log("[USER DATA] ✅ Privy token validated successfully");
      }
      
      // Get email from Privy user
      const email = getPrivyEmail(privyUser);
      console.log("[USER DATA] Extracted email:", email);
      
      if (!email) {
        console.error("[USER DATA] ❌ No email found in Privy user data");
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
      console.log("[USER DATA] Calling createUserSecurely Edge Function");
      const insertedUser = await createUserSecurely(userData);
      
      console.log("[USER DATA] Edge Function response:", insertedUser);
      
      if (!insertedUser) {
        console.error("[USER DATA] ❌ No user data returned after insert");
        setAuthError("Failed to create your profile. No data returned.");
        return null;
      }
      
      // Set up auth context after user creation
      console.log("[USER DATA] Setting up auth context after user creation");
      await setSupabaseAuth(privyUserId);
      console.log("[USER DATA] ✅ Auth context set after user creation");
      
      console.log("[USER DATA] ✅ User created successfully:", insertedUser.id);
      console.log("[USER DATA] ====== CREATE USER SUCCESS ======");
      return insertedUser as User;
    } catch (error: any) {
      console.error("[USER DATA] ❌ Error in createUser:", error);
      console.error("[USER DATA] Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack
      });
      
      // Provide more specific error messages
      if (error.message?.includes('Failed to create user')) {
        setAuthError(error.message);
      } else if (error.message?.includes('row-level security')) {
        setAuthError("Permission denied: Unable to create user profile");
      } else {
        setAuthError(`Failed to create your profile: ${error?.message || 'Unknown error'}`);
      }
      console.log("[USER DATA] ====== CREATE USER ERROR ======");
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
