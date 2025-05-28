
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';

export interface Invitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  groups?: {
    name: string;
    icon: string;
  };
}

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchInvitations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          groups (
            name,
            icon
          )
        `)
        .eq('status', 'pending');

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      // Get the invitation details
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (inviteError) throw inviteError;

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      toast.success('Invitation accepted successfully!');
      fetchInvitations();
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation declined');
      fetchInvitations();
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  return {
    invitations,
    loading,
    acceptInvitation,
    declineInvitation,
    refetch: fetchInvitations
  };
};
