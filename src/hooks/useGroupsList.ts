
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';
import { Group } from '@/types/supabase';

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
      
      // First, get the group IDs the user belongs to
      const { data: groupIds, error: functionError } = await supabase
        .rpc('user_groups', { user_id_param: user.id });
        
      if (functionError) {
        console.error("Error fetching group IDs:", functionError);
        throw functionError;
      }
      
      console.log("Group IDs:", groupIds);
      
      if (groupIds && groupIds.length > 0) {
        // Fetch group details using the Edge Function to bypass RLS issues
        const groupDetailsPromises = groupIds.map(async (groupId: string) => {
          try {
            const { data, error } = await supabase.functions.invoke('get-group-data', {
              body: { groupId, userId: user.id }
            });
            
            if (error) {
              console.error(`Error fetching group ${groupId}:`, error);
              return null;
            }
            
            return data.data;
          } catch (err) {
            console.error(`Error fetching group ${groupId}:`, err);
            return null;
          }
        });
        
        const groupsData = await Promise.all(groupDetailsPromises);
        const validGroups = groupsData.filter(group => group !== null);
        
        console.log("Groups data:", validGroups);
        setGroups(validGroups || []);
      } else {
        console.log("No groups found for user");
        setGroups([]);
      }
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
      const groupsChannel = supabase
        .channel('groups-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'groups' },
          () => fetchGroups()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(groupsChannel);
      };
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
