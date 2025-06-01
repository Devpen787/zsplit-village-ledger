
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupDeletion = () => {
  const [loading, setLoading] = useState(false);

  const deleteGroup = async (groupId: string) => {
    setLoading(true);
    try {
      console.log('Starting group deletion for:', groupId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to delete groups');
        return false;
      }

      // First, delete all expenses associated with this group
      const { error: expensesError } = await supabase
        .from('expenses')
        .delete()
        .eq('group_id', groupId);

      if (expensesError) {
        console.error('Error deleting group expenses:', expensesError);
        // Don't fail completely, continue with group deletion
      }

      // Delete group members
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      if (membersError) {
        console.error('Error deleting group members:', membersError);
        toast.error('Failed to delete group members');
        return false;
      }

      // Delete any pending invitations
      const { error: invitationsError } = await supabase
        .from('invitations')
        .delete()
        .eq('group_id', groupId);

      if (invitationsError) {
        console.error('Error deleting invitations:', invitationsError);
        // Don't fail completely, continue with group deletion
      }

      // Finally, delete the group itself
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (groupError) {
        console.error('Error deleting group:', groupError);
        toast.error('Failed to delete group');
        return false;
      }

      console.log('Group deleted successfully');
      toast.success('Group deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast.error(`Failed to delete group: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteGroup, loading };
};
