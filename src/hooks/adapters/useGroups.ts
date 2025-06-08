
import { useState, useEffect, useCallback } from 'react';
import { storageAdapter } from '@/adapters';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';
import { Group } from '@/adapters/types';

export const useGroupsList = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRecursionError, setHasRecursionError] = useState(false);
  const { user } = useAuth();

  const fetchGroups = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setHasRecursionError(false);
    
    try {
      console.log("Fetching groups for user:", user.id);
      
      const groupsData = await storageAdapter.getGroups(user.id);
      console.log("Groups data:", groupsData);
      setGroups(groupsData || []);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      setError(`Failed to load groups: ${error.message}`);
      toast.error(`Failed to load groups: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchGroups();
      
      // Set up real-time subscription for groups
      const unsubscribe = storageAdapter.subscribeToChanges(
        'groups',
        () => fetchGroups()
      );

      return unsubscribe;
    }
  }, [user, fetchGroups]);

  return { 
    groups, 
    loading, 
    error, 
    hasRecursionError, 
    fetchGroups 
  };
};
