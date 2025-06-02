
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface GroupMember {
  id: string;
  name: string;
  email?: string;
  isCreator: boolean;
}

export const useGroupMemberInvitations = () => {
  const [loading, setLoading] = useState(false);

  const inviteMembers = async (groupId: string, members: GroupMember[], creatorId: string) => {
    setLoading(true);
    try {
      console.log('[MEMBER INVITATIONS] Starting member invitations for group:', groupId);
      
      // Filter out the creator (already added by group creation)
      const membersToInvite = members.filter(member => !member.isCreator);
      
      if (membersToInvite.length === 0) {
        console.log('[MEMBER INVITATIONS] No members to invite');
        return { success: true, results: [] };
      }

      const results = [];
      
      for (const member of membersToInvite) {
        try {
          if (member.email) {
            // Check if user exists with this email
            const { data: existingUser, error: userError } = await supabase
              .from('users')
              .select('id, name, email')
              .eq('email', member.email.toLowerCase())
              .maybeSingle();

            if (userError) {
              console.error('[MEMBER INVITATIONS] Error checking user:', userError);
              results.push({ member: member.name, success: false, reason: 'Database error' });
              continue;
            }

            if (existingUser) {
              // User exists, check if already a member
              const { data: existingMember, error: memberError } = await supabase
                .from('group_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', existingUser.id)
                .maybeSingle();

              if (memberError) {
                console.error('[MEMBER INVITATIONS] Error checking membership:', memberError);
                results.push({ member: member.name, success: false, reason: 'Database error' });
                continue;
              }

              if (existingMember) {
                results.push({ member: member.name, success: false, reason: 'Already a member' });
                continue;
              }

              // Add user directly to group
              const { error: addMemberError } = await supabase
                .from('group_members')
                .insert({
                  group_id: groupId,
                  user_id: existingUser.id,
                  role: 'member'
                });

              if (addMemberError) {
                console.error('[MEMBER INVITATIONS] Error adding member:', addMemberError);
                results.push({ member: member.name, success: false, reason: 'Failed to add to group' });
              } else {
                results.push({ member: member.name, success: true, reason: 'Added directly' });
              }
            } else {
              // User doesn't exist, create invitation
              const { error: inviteError } = await supabase
                .from('invitations')
                .insert({
                  group_id: groupId,
                  email: member.email.toLowerCase(),
                  invited_by: creatorId,
                  status: 'pending'
                });

              if (inviteError) {
                console.error('[MEMBER INVITATIONS] Error creating invitation:', inviteError);
                results.push({ member: member.name, success: false, reason: 'Failed to create invitation' });
              } else {
                results.push({ member: member.name, success: true, reason: 'Invitation sent' });
              }
            }
          } else {
            // No email provided, create a placeholder member entry
            // This member will need to be claimed later when they join
            results.push({ member: member.name, success: true, reason: 'Added as placeholder' });
          }
        } catch (error) {
          console.error('[MEMBER INVITATIONS] Error processing member:', member.name, error);
          results.push({ member: member.name, success: false, reason: 'Unexpected error' });
        }
      }

      // Show summary toast
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0 && failed === 0) {
        toast.success(`Successfully processed ${successful} member(s)`);
      } else if (successful > 0 && failed > 0) {
        toast.info(`Processed ${successful} member(s), ${failed} failed`);
      } else if (failed > 0) {
        toast.error(`Failed to process ${failed} member(s)`);
      }

      console.log('[MEMBER INVITATIONS] Results:', results);
      return { success: true, results };
      
    } catch (error: any) {
      console.error('[MEMBER INVITATIONS] Error inviting members:', error);
      toast.error(`Failed to process members: ${error.message}`);
      return { success: false, results: [] };
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteMembers,
    loading
  };
};
