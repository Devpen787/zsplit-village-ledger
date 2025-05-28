
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupInvitations = (groupId: string | undefined) => {
  const [loading, setLoading] = useState(false);

  const sendInvitation = async (email: string, invitedBy: string) => {
    if (!groupId) throw new Error('Group ID is required');
    
    setLoading(true);
    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (userError) throw userError;

      if (!userData) {
        toast.error('User not found with that email address');
        return;
      }

      // Check if user is already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userData.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (existingMember) {
        toast.info('User is already a member of this group');
        return;
      }

      // Check if invitation already exists
      const { data: existingInvite, error: inviteError } = await supabase
        .from('invitations')
        .select('id, status')
        .eq('group_id', groupId)
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (inviteError) throw inviteError;

      if (existingInvite) {
        if (existingInvite.status === 'pending') {
          toast.info('Invitation already sent to this email');
          return;
        }
        // If invitation was declined, we can send a new one
        const { error: updateError } = await supabase
          .from('invitations')
          .update({ 
            status: 'pending',
            invited_by: invitedBy,
            created_at: new Date().toISOString()
          })
          .eq('id', existingInvite.id);

        if (updateError) throw updateError;
      } else {
        // Create new invitation
        const { error: createError } = await supabase
          .from('invitations')
          .insert({
            group_id: groupId,
            email: email.toLowerCase(),
            invited_by: invitedBy,
            status: 'pending'
          });

        if (createError) throw createError;
      }

      toast.success(`Invitation sent to ${email}`);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(`Failed to send invitation: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendInvitation,
    loading
  };
};
