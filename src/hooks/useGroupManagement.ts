
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useGroupManagement = () => {
  const [loading, setLoading] = useState(false);

  const updateMemberRole = async (groupId: string, userId: string, newRole: 'admin' | 'member' | 'participant') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(`Member role updated to ${newRole}`);
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (groupId: string, userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Member removed from group');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateMemberRole,
    removeMember,
    loading
  };
};
