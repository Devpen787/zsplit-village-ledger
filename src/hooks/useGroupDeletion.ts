
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupDeletion = () => {
  const [loading, setLoading] = useState(false);

  const deleteGroup = async (groupId: string) => {
    setLoading(true);
    try {
      // Delete group members first
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      if (membersError) {
        console.error('Error deleting group members:', membersError);
        toast.error('Failed to delete group members');
        return false;
      }

      // Delete the group
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (groupError) {
        console.error('Error deleting group:', groupError);
        toast.error('Failed to delete group');
        return false;
      }

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
