
import { useState, useEffect } from 'react';
import { supabase, makeAuthenticatedRequest, verifyGroupMembership } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/supabase';
import { User } from '@/types/auth';

export const useGroupData = (id: string | undefined, user: User | null) => {
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
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
      
      // First, verify membership using the Edge Function (bypasses RLS/auth issues)
      console.log("👥 Verifying membership via Edge Function...");
      const membershipResult = await verifyGroupMembership(id, user.id);
      
      if (!membershipResult.isMember) {
        console.log("❌ User is not a member of this group");
        toast.error("You are not a member of this group");
        navigate('/group');
        return;
      }
      
      console.log("✅ Membership confirmed via Edge Function, role:", membershipResult.role);
      
      // Now fetch the group data since we confirmed membership
      console.log("📡 Fetching group data...");
      const response = await makeAuthenticatedRequest(user.id, async () => {
        return await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .single();
      });
      
      console.log("📥 Group data response:", response);
        
      if (response.error) {
        console.error("❌ Error fetching group:", response.error);
        throw response.error;
      }
      
      if (!response.data) {
        console.log("⚠️ No group found with ID:", id);
        toast.error("Group not found");
        navigate('/group');
        return;
      }
      
      console.log("✅ Group data found:", response.data);
      setGroup(response.data);
      
    } catch (error: any) {
      console.error("💥 Error in fetchGroupDetails:", error);
      
      // More specific error handling
      if (error.message?.includes('JWT')) {
        console.error("🔐 Authentication issue detected");
        toast.error("Authentication issue - please sign in again");
      } else if (error.code === 'PGRST116') {
        console.error("🚫 RLS policy blocking access");
        toast.error("Access denied - you may not be a member of this group");
      } else if (error.message?.includes('Failed to verify membership')) {
        console.error("👥 Membership verification failed");
        toast.error("Unable to verify group membership");
      } else {
        toast.error(`Error loading group: ${error.message}`);
      }
      
      // Don't navigate away immediately for authentication issues
      if (!error.message?.includes('JWT')) {
        setTimeout(() => navigate('/group'), 2000);
      }
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
    loading,
    refreshData: fetchGroupDetails
  };
};
