
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Invitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  status: string;
  created_at: string;
  groups?: {
    name: string;
    icon: string;
  };
  inviter?: {
    name: string;
    email: string;
  };
}

export const PendingInvitationsNotice: React.FC = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchPendingInvitations();
    }
  }, [user]);

  const fetchPendingInvitations = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          group_id,
          email,
          invited_by,
          status,
          created_at,
          groups:group_id (
            name,
            icon
          ),
          inviter:invited_by (
            name,
            email
          )
        `)
        .eq('email', user.email.toLowerCase())
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitation = async (invitationId: string, groupId: string, accept: boolean) => {
    if (!user) return;

    setProcessing(invitationId);
    try {
      if (accept) {
        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingMember) {
          // Add user to group
          const { error: memberError } = await supabase
            .from('group_members')
            .insert({
              group_id: groupId,
              user_id: user.id,
              role: 'member'
            });

          if (memberError) {
            throw memberError;
          }
        }

        // Update invitation status to accepted
        const { error: updateError } = await supabase
          .from('invitations')
          .update({ status: 'accepted' })
          .eq('id', invitationId);

        if (updateError) {
          throw updateError;
        }

        toast.success('Invitation accepted! You are now a member of the group.');
      } else {
        // Update invitation status to declined
        const { error: updateError } = await supabase
          .from('invitations')
          .update({ status: 'declined' })
          .eq('id', invitationId);

        if (updateError) {
          throw updateError;
        }

        toast.info('Invitation declined.');
      }

      // Refresh invitations
      await fetchPendingInvitations();
    } catch (error: any) {
      console.error('Error handling invitation:', error);
      toast.error(`Failed to ${accept ? 'accept' : 'decline'} invitation: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading || invitations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Mail className="h-5 w-5" />
          Group Invitations
          <Badge variant="secondary">{invitations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{invitation.groups?.icon || '👥'}</span>
              <div>
                <p className="font-medium">{invitation.groups?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Invited by {invitation.inviter?.name || invitation.inviter?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInvitation(invitation.id, invitation.group_id, false)}
                disabled={processing === invitation.id}
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleInvitation(invitation.id, invitation.group_id, true)}
                disabled={processing === invitation.id}
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
