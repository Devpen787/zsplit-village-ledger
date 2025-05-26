
import { useState, useEffect } from 'react';
import { supabase, makeAuthenticatedRequest } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/supabase';
import { User } from '@/types/auth';

export const useGroupData = (id: string | undefined, user: User | null) => {
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchGroupDetails = async () => {
    if (!id || !user) return;
    
    setLoading(true);
    try {
      console.log("Fetching group details for:", id);
      
      // Use authenticated request wrapper to ensure proper auth context
      const response = await makeAuthenticatedRequest(user.id, async () => {
        return await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully
      });
        
      if (response.error) {
        console.error("Error fetching group:", response.error);
        throw response.error;
      }
      
      if (!response.data) {
        console.log("No group found with ID:", id);
        toast.error("Group not found or you don't have access to it");
        navigate('/group');
        return;
      }
      
      console.log("Group data:", response.data);
      setGroup(response.data);
      
    } catch (error: any) {
      console.error("Error fetching group:", error);
      toast.error(`Error loading group: ${error.message}`);
      // Don't navigate away immediately, let user try again
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!id) return;
    
    fetchGroupDetails();
    
    const groupsChannel = supabase
      .channel(`group-${id}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups', filter: `id=eq.${id}` },
        () => fetchGroupDetails()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(groupsChannel);
    };
  }, [id, user]);

  return {
    group,
    loading,
    refreshData: fetchGroupDetails
  };
};
