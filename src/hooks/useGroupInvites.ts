
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupInvites = (groupId: string | undefined) => {
  const inviteMember = async (inviteEmail: string, userId: string) => {
    if (!groupId || !userId) throw new Error("Missing group or user information");
    
    console.log("[GROUP INVITES] Starting invitation process for email:", inviteEmail, "to group:", groupId);
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
        // User doesn't exist - create them and add to group automatically
        console.log("[GROUP INVITES] User doesn't exist, creating user and adding to group:", inviteEmail);
        
        // Create a placeholder user that will be claimed when they sign up
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert({
            email: inviteEmail.toLowerCase(),
            name: inviteEmail.split('@')[0], // Use email prefix as placeholder name
            id: `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
          .select()
          .single();

        if (createUserError) {
          console.error("[GROUP INVITES] Error creating placeholder user:", createUserError);
          toast.error(`Failed to create user: ${createUserError.message}`);
          throw createUserError;
        }

        console.log("[GROUP INVITES] Created placeholder user:", newUser);

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
          console.error("[GROUP INVITES] Error adding placeholder member:", addMemberError);
          toast.error(`Failed to add member: ${addMemberError.message}`);
          throw addMemberError;
        }

        console.log("[GROUP INVITES] Successfully added placeholder member:", newMember);
        toast.success(`${inviteEmail} has been added to the group. They can claim their account when they sign up.`);
      }
    } catch (error: any) {
      console.error("[GROUP INVITES] Invitation process failed:", error);
      throw error;
    }
  };

  return { inviteMember };
};
