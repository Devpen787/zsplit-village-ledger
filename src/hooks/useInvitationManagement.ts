import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface SentInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  invited_by: string;
}

export const useInvitationManagement = (groupId: string | undefined) => {
  const [sentInvitations, setSentInvitations] = useState<SentInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSentInvitations = async () => {
    if (!groupId) return;
    
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Properly type the invitations with explicit mapping
      const typedInvitations: SentInvitation[] = (data || []).map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        status: invitation.status as 'pending' | 'accepted' | 'declined',
        created_at: invitation.created_at,
        invited_by: invitation.invited_by
      }));
      
      setSentInvitations(typedInvitations);
    } catch (error: any) {
      console.error('Error fetching sent invitations:', error);
      toast.error('Failed to load sent invitations');
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation cancelled');
      fetchSentInvitations();
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ 
          created_at: new Date().toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation resent');
      fetchSentInvitations();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchSentInvitations();
    }
  }, [groupId]);

  return {
    sentInvitations,
    loading,
    cancelInvitation,
    resendInvitation,
    refetch: fetchSentInvitations
  };
};
