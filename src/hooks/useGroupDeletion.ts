
import { useState } from 'react';
import { storageAdapter } from '@/adapters';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';

export const useGroupDeletion = () => {
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const deleteGroup = async (groupId: string) => {
    setLoading(true);
    try {
      console.log('Starting group deletion for:', groupId);
      
      // Check if user is authenticated using our auth context
      if (!isAuthenticated || !user) {
        toast.error('You must be logged in to delete groups');
        return false;
      }

      console.log('Authenticated user:', user.id);

      // Use the storage adapter to delete the group
      await storageAdapter.deleteGroup(groupId);

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
