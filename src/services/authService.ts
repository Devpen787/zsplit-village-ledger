
import { supabase } from "@/integrations/supabase/client";
import { SignupFormValues, LoginFormValues } from "@/schemas/authSchemas";
import { cleanupAuthState } from "@/utils/authUtils";

export async function checkEmailExists(email: string) {
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle();
  
  return existingUser !== null;
}

export async function registerUser(values: SignupFormValues) {
  // Clean up any existing auth state first
  cleanupAuthState();
  
  // Try to sign out globally first (catches any lingering sessions)
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    // Continue even if this fails
    console.warn('Failed to sign out before registration:', err);
  }
  
  // Step 1: Register user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        name: values.name,
        group_name: values.groupName || null,
        wallet_address: values.walletAddress || null,
      },
    },
  });

  if (authError) throw authError;

  if (!authData.user) {
    throw new Error("No user returned after signup");
  }

  // Step 2: Insert user data into users table with the correct ID
  const { error: insertError } = await supabase.from('users').insert({
    id: authData.user.id, // Ensure ID matches auth.uid()
    email: values.email,
    name: values.name,
    group_name: values.groupName || null,
    wallet_address: values.walletAddress || null,
    role: 'participant', // Default role for self-registration
  });

  if (insertError) throw insertError;

  return authData.user;
}

export async function loginUser(values: LoginFormValues) {
  // Clean up any existing auth state first
  cleanupAuthState();
  
  // Try to sign out globally first (catches any lingering sessions)
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    // Continue even if this fails
    console.warn('Failed to sign out before login:', err);
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) throw error;

  return data.user;
}
