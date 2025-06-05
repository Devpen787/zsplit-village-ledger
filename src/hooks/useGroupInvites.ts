
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
          return;
        }

        // User exists but isn't a member - add them directly
        console.log("[GROUP INVITES] Adding user directly to group");
        const { data: newMember, error: addError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: userData.id,
            role: 'member'
          })
          .select()
          .single();
          
        if (addError) {
          console.error("[GROUP INVITES] Error adding member:", addError);
          toast.error(`Failed to add member: ${addError.message}`);
          throw addError;
        }
        
        console.log("[GROUP INVITES] Successfully added member:", newMember);
        toast.success(`Successfully added ${userData.name || inviteEmail} to the group`);
        
      } else {
        // User doesn't exist - create them using the secure Edge Function
        console.log("[GROUP INVITES] User doesn't exist, creating user securely:", inviteEmail);
        
        const placeholderUserId = `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          const newUser = await createUserSecurely({
            user_id: placeholderUserId,
            user_email: inviteEmail.toLowerCase(),
            user_name: inviteName || inviteEmail.split('@')[0],
            user_role: 'participant'
          });

          console.log("[GROUP INVITES] Created user securely:", newUser);

          // Add them to the group
          const { data: newMember, error: addMemberError } = await supabase
            .from('group_members')
            .insert({
              group_id: groupId,
              user_id: newUser.id,
              role: 'member'
            })
            .select()
            .single();

          if (addMemberError) {
            console.error("[GROUP INVITES] Error adding member:", addMemberError);
            toast.error(`Failed to add member: ${addMemberError.message}`);
            throw addMemberError;
          }

          console.log("[GROUP INVITES] Successfully added member:", newMember);
          toast.success(`${inviteName || inviteEmail} has been added to the group. They can claim their account when they sign up.`);
          
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
