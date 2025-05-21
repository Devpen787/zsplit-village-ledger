
import { supabase } from "@/integrations/supabase/client";

// Type for user role validation
export type UserRole = 'participant' | 'organizer' | 'admin';

/**
 * Validates if a string is a valid user role
 */
export const isValidRole = (role: string): boolean => {
  const allowedRoles: UserRole[] = ['participant', 'organizer', 'admin'];
  return allowedRoles.includes(role as UserRole);
};

/**
 * Create or update a user profile in Supabase based on Privy user data
 */
export async function createOrUpdateUserProfile(privyUser: any) {
  if (!privyUser) return null;
  
  try {
    // Get email and wallet from privy user
    const email = privyUser.email?.address || null;
    const linkedAccounts = privyUser.linkedAccounts || [];
    const wallet = linkedAccounts.find((account: any) => account.type === 'wallet')?.address || null;
    
    // Check if user exists in our database with the Privy ID
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', privyUser.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching user by ID:', fetchError);
      
      // Try a different approach - get user by email if available
      if (email) {
        console.log('Trying to find user by email:', email);
        
        const { data: userByEmail, error: emailFetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();
          
        if (emailFetchError) {
          console.error('Error fetching user by email:', emailFetchError);
        }
          
        if (userByEmail) {
          console.log('Found user by email, updating ID to Privy ID');
          
          // Update the existing user's ID to match the Privy ID
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: privyUser.id })
            .eq('email', email);
            
          if (updateError) {
            console.error('Error updating user ID:', updateError);
            return null;
          } else {
            return {
              id: privyUser.id,
              email: email,
              name: userByEmail.name,
              role: userByEmail.role,
              group_name: userByEmail.group_name,
              wallet_address: wallet || userByEmail.wallet_address
            };
          }
        }
      }
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
          return null;
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
      
      console.log('Creating new user with Privy ID:', newUser);
      
      const { data, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();
        
      if (insertError) {
        console.error('Error creating user:', insertError);
        return null;
      }
      
      return newUser;
    }
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error);
    return null;
  }
}
