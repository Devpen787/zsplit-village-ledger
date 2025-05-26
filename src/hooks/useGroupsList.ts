
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
      
      // Use the new user_groups function to fetch group IDs securely
      const { data: groupIds, error: functionError } = await supabase
        .rpc('user_groups', { user_id_param: user.id });
        
      if (functionError) {
        console.error("Error fetching group IDs:", functionError);
        
        // Special handling for recursive RLS policy errors
        if (functionError.message?.includes('infinite recursion') || functionError.code === '42P17') {
          setHasRecursionError(true);
          setError("Database policy configuration issue");
          return;
        }
        
        throw functionError;
      }
      
      console.log("Group IDs:", groupIds);
      
      if (groupIds && groupIds.length > 0) {
        // Fetch group details
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          
          // Special handling for recursive RLS policy errors
          if (groupsError.message?.includes('infinite recursion') || groupsError.code === '42P17') {
            setHasRecursionError(true);
            setError("Database policy configuration issue");
            return;
          }
          
          throw groupsError;
        }
        
        console.log("Groups data:", groupsData);
        setGroups(groupsData || []);
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
