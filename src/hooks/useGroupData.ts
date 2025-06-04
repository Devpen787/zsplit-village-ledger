
import { useState, useEffect } from 'react';
import { supabase, getGroupData } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/supabase';
import { User } from '@/types/auth';

export const useGroupData = (id: string | undefined, user: User | null) => {
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchGroupDetails = async () => {
    console.log("🔍 fetchGroupDetails called with:", { id, user: user?.id });
    
    if (!id || !user) {
      console.log("❌ Missing id or user:", { id, userId: user?.id });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("🔄 Starting group data fetch for:", id);
      
      // Use the new Edge Function to fetch group data (bypasses all RLS issues)
      console.log("📡 Fetching group data via Edge Function...");
      
      const result = await getGroupData(id, user.id);
      
      console.log("✅ Group data fetched successfully:", result);
      setGroup(result.group);
      setMembership(result.membership);
      
    } catch (error: any) {
      console.error("💥 Error in fetchGroupDetails:", error);
      
      // More specific error handling
      if (error.message?.includes('Not a member of this group')) {
        console.error("🚫 User is not a member");
        toast.error("You are not a member of this group");
      } else if (error.message?.includes('Failed to fetch group data')) {
        console.error("📡 Group data fetch failed");
        toast.error("Unable to load group data. Please try again.");
      } else {
        toast.error(`Error loading group: ${error.message}`);
      }
      
      setTimeout(() => navigate('/group'), 2000);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log("🎯 useGroupData useEffect triggered:", { id, userId: user?.id });
    
    // For newly created groups, add a delay to ensure database consistency
    const timeoutId = setTimeout(() => {
      fetchGroupDetails();
    }, 100);
    
    // Set up real-time subscription for groups
    if (id) {
      console.log("📡 Setting up real-time subscription for group:", id);
      const groupsChannel = supabase
        .channel(`group-${id}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'groups', filter: `id=eq.${id}` },
          (payload) => {
            console.log("🔄 Real-time update received:", payload);
            fetchGroupDetails();
          }
        )
        .subscribe();
        
      return () => {
        clearTimeout(timeoutId);
        console.log("🔌 Unsubscribing from real-time channel for group:", id);
        supabase.removeChannel(groupsChannel);
      };
    }
    
    return () => clearTimeout(timeoutId);
  }, [id, user]);

  return {
    group,
    membership,
    loading,
    refreshData: fetchGroupDetails
  };
};
