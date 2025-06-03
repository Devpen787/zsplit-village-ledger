
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
        // User doesn't exist - create a pending invitation
        console.log("[GROUP INVITES] User doesn't exist, creating invitation for:", inviteEmail);
        
        // Check if invitation already exists
        const { data: existingInvite, error: inviteCheckError } = await supabase
          .from('invitations')
          .select('id, status')
          .eq('group_id', groupId)
          .eq('email', inviteEmail.toLowerCase())
          .maybeSingle();

        if (inviteCheckError) {
          console.error("[GROUP INVITES] Error checking invitation:", inviteCheckError);
          toast.error(`Error checking existing invitations: ${inviteCheckError.message}`);
          throw inviteCheckError;
        }

        if (existingInvite && existingInvite.status === 'pending') {
          console.log("[GROUP INVITES] Invitation already exists:", existingInvite);
          toast.info("Invitation already sent to this email");
          return;
        }
        
        // Create or update invitation
        if (existingInvite) {
          console.log("[GROUP INVITES] Updating existing invitation");
          const { error: updateError } = await supabase
            .from('invitations')
            .update({ 
              status: 'pending',
              invited_by: userId,
              created_at: new Date().toISOString()
            })
            .eq('id', existingInvite.id);

          if (updateError) {
            console.error("[GROUP INVITES] Error updating invitation:", updateError);
            toast.error(`Failed to update invitation: ${updateError.message}`);
            throw updateError;
          }
        } else {
          console.log("[GROUP INVITES] Creating new invitation");
          const { error: createError } = await supabase
            .from('invitations')
            .insert({
              group_id: groupId,
              email: inviteEmail.toLowerCase(),
              invited_by: userId,
              status: 'pending'
            });

          if (createError) {
            console.error("[GROUP INVITES] Error creating invitation:", createError);
            toast.error(`Failed to create invitation: ${createError.message}`);
            throw createError;
          }
        }
        
        console.log("[GROUP INVITES] Invitation created successfully");
        toast.success(`Invitation sent to ${inviteEmail}. They will see it when they sign up.`);
      }
    } catch (error: any) {
      console.error("[GROUP INVITES] Invitation process failed:", error);
      // Don't show another toast here since we already showed one above
      throw error;
    }
  };

  return { inviteMember };
};
