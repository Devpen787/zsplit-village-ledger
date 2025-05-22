
import { useState, useCallback } from 'react';
import { User } from '@/types/auth';
import { supabase, setSupabaseAuth } from '@/integrations/supabase/client';
import { getPrivyEmail } from './authUtils';

/**
 * Hook to handle fetching and creating user data
 */
export const useUserData = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Function to fetch a user from Supabase
  const fetchUser = useCallback(async (privyUserId: string): Promise<User | null> => {
    try {
      console.log("Attempting to fetch user with ID:", privyUserId);
      
      // Set Supabase auth with the Privy user ID
      await setSupabaseAuth(privyUserId);
      
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
  const createUser = useCallback(async (privyUserId: string, privyUser: any): Promise<User | null> => {
    try {
      console.log("Attempting to create new user with ID:", privyUserId);
      
      // Get email from Privy user
      const email = getPrivyEmail(privyUser);
      
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
  
  return {
    fetchUser,
    createUser,
    authError,
    setAuthError,
    clearAuthError: () => setAuthError(null)
  };
};
