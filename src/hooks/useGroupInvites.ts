
import { supabase, createUserSecurely } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupInvites = (groupId: string | undefined) => {
  const inviteMember = async (inviteEmail: string, userId: string, inviteName?: string) => {
    if (!groupId || !userId) throw new Error("Missing group or user information");
    
    console.log("[GROUP INVITES] Starting invitation process for email:", inviteEmail, "name:", inviteName, "to group:", groupId);
    console.log("[GROUP INVITES] Invited by user:", userId);
    
    try {
      // Check if user exists
      console.log("[GROUP INVITES] Checking if user exists with email:", inviteEmail);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', inviteEmail.toLowerCase())
        .maybeSingle();
        
      if (userError) {
        console.error("[GROUP INVITES] Error checking user:", userError);
        toast.error(`Database error: ${userError.message}`);
        throw userError;
      }
      
      if (userData) {
        console.log("[GROUP INVITES] User found:", userData);
        
        // Check if user is already a member
        console.log("[GROUP INVITES] Checking if user is already a member");
        const { data: existingMember, error: memberCheckError } = await supabase
          .from('group_members')
          .select('id, role')
          .eq('group_id', groupId)
          .eq('user_id', userData.id)
          .maybeSingle();
          
        if (memberCheckError) {
          console.error("[GROUP INVITES] Error checking membership:", memberCheckError);
          toast.error(`Error checking membership: ${memberCheckError.message}`);
          throw memberCheckError;
        }
        
        if (existingMember) {
          console.log("[GROUP INVITES] User is already a member:", existingMember);
          toast.info(`${userData.name || inviteEmail} is already a member of this group`);
          return { success: false, reason: 'already_member' };
        }

        // User exists but isn't a member - use Edge Function to add them
        console.log("[GROUP INVITES] Adding existing user to group via Edge Function");
        try {
          const result = await supabase.functions.invoke('create-user', {
            body: {
              user_id: userData.id,
              user_email: userData.email,
              user_name: userData.name,
              group_id: groupId
            }
          });

          if (result.error) {
            console.error("[GROUP INVITES] Error from Edge Function:", result.error);
            toast.error(`Failed to add member: ${result.error.message}`);
            throw result.error;
          }

          console.log("[GROUP INVITES] Successfully added existing user to group");
          toast.success(`Successfully added ${userData.name || inviteEmail} to the group`);
          return { success: true, user: userData };
          
        } catch (edgeFunctionError) {
          console.error("[GROUP INVITES] Edge Function call failed:", edgeFunctionError);
          toast.error(`Failed to add member: ${edgeFunctionError.message}`);
          throw edgeFunctionError;
        }
        
      } else {
        // User doesn't exist - create them using the secure Edge Function
        console.log("[GROUP INVITES] User doesn't exist, creating user securely:", inviteEmail);
        
        const placeholderUserId = `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          const result = await supabase.functions.invoke('create-user', {
            body: {
              user_id: placeholderUserId,
              user_email: inviteEmail.toLowerCase(),
              user_name: inviteName || inviteEmail.split('@')[0],
              group_id: groupId
            }
          });

          if (result.error) {
            console.error("[GROUP INVITES] Error from Edge Function:", result.error);
            toast.error(`Failed to create user: ${result.error.message}`);
            throw result.error;
          }

          console.log("[GROUP INVITES] Created user and added to group successfully:", result.data);
          toast.success(`${inviteName || inviteEmail} has been added to the group. They can claim their account when they sign up.`);
          return { success: true, user: result.data };
          
        } catch (createError) {
          console.error("[GROUP INVITES] Error creating user securely:", createError);
          toast.error(`Failed to create user: ${createError.message}`);
          throw createError;
        }
      }
    } catch (error: any) {
      console.error("[GROUP INVITES] Invitation process failed:", error);
      throw error;
    }
  };

  return { inviteMember };
};
