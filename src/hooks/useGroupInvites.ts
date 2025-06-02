
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupInvites = (groupId: string | undefined) => {
  const inviteMember = async (inviteEmail: string, userId: string) => {
    if (!groupId || !userId) throw new Error("Missing group or user information");
    
    console.log("[GROUP INVITES] Inviting email:", inviteEmail, "to group:", groupId);
    
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', inviteEmail.toLowerCase())
      .maybeSingle();
      
    if (userError) {
      console.error("[GROUP INVITES] Error checking user:", userError);
      throw userError;
    }
    
    // Check if user is already a member
    if (userData) {
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userData.id)
        .maybeSingle();
        
      if (memberCheckError) {
        console.error("[GROUP INVITES] Error checking membership:", memberCheckError);
        throw memberCheckError;
      }
      
      if (existingMember) {
        toast.info("This user is already a member of this group");
        throw new Error("This user is already a member of this group");
      }

      // User exists but isn't a member - add them directly
      const { error: addError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userData.id,
          role: 'member'
        });
        
      if (addError) {
        console.error("[GROUP INVITES] Error adding member:", addError);
        throw addError;
      }
      
      toast.success(`Successfully added ${inviteEmail} to the group`);
    } else {
      // User doesn't exist - create a pending invitation
      console.log("[GROUP INVITES] User doesn't exist, creating invitation");
      
      // Check if invitation already exists
      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from('invitations')
        .select('id, status')
        .eq('group_id', groupId)
        .eq('email', inviteEmail.toLowerCase())
        .maybeSingle();

      if (inviteCheckError) {
        console.error("[GROUP INVITES] Error checking invitation:", inviteCheckError);
        throw inviteCheckError;
      }

      if (existingInvite) {
        if (existingInvite.status === 'pending') {
          toast.info("Invitation already sent to this email");
          return;
        }
        
        // Update existing invitation to pending
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
          throw updateError;
        }
      } else {
        // Create new invitation
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
          throw createError;
        }
      }
      
      toast.success(`Invitation sent to ${inviteEmail}. They will see it when they log in.`);
    }
  };

  return { inviteMember };
};
