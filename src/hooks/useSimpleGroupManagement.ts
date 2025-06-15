
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useSimpleGroupManagement = () => {
  const [loading, setLoading] = useState(false);

  const updateMemberRole = async (groupId: string, userId: string, newRole: 'admin' | 'member' | 'participant') => {
    setLoading(true);
    try {
      console.log("[GROUP MANAGEMENT] Updating role:", { groupId, userId, newRole });
      
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error("[GROUP MANAGEMENT] Error updating role:", error);
        throw error;
      }

      console.log("[GROUP MANAGEMENT] Role updated successfully");
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
      console.log("[GROUP MANAGEMENT] Removing member:", { groupId, userId });
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error("[GROUP MANAGEMENT] Error removing member:", error);
        throw error;
      }

      console.log("[GROUP MANAGEMENT] Member removed successfully");
      toast.success('Member removed from group');
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (groupId: string, userId: string, role: string = 'member') => {
    setLoading(true);
    try {
      console.log("[GROUP MANAGEMENT] Adding member:", { groupId, userId, role });
      
      const { error } = await supabase
        .from('group_members')
        .insert({ 
          group_id: groupId, 
          user_id: userId, 
          role 
        });

      if (error) {
        console.error("[GROUP MANAGEMENT] Error adding member:", error);
        throw error;
      }

      console.log("[GROUP MANAGEMENT] Member added successfully");
      toast.success('Member added to group');
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateMemberRole,
    removeMember,
    addMember,
    loading
  };
};
