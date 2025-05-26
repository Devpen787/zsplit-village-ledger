
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
    console.log("🔍 fetchGroupDetails called with:", { id, user: user?.id });
    
    if (!id || !user) {
      console.log("❌ Missing id or user:", { id, userId: user?.id });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("🔄 Fetching group details for:", id);
      
      // First, verify user membership before trying to fetch group data
      console.log("👥 Checking user membership first...");
      const membershipCheck = await makeAuthenticatedRequest(user.id, async () => {
        return await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
      });
      
      console.log("👥 Membership check result:", membershipCheck);
      
      if (membershipCheck.error) {
        console.error("❌ Error checking membership:", membershipCheck.error);
        throw new Error(`Membership check failed: ${membershipCheck.error.message}`);
      }
      
      if (!membershipCheck.data) {
        console.log("❌ User is not a member of this group");
        toast.error("You are not a member of this group");
        navigate('/group');
        return;
      }
      
      console.log("✅ User is a member with role:", membershipCheck.data.role);
      
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
        console.error("Error details:", {
          code: response.error.code,
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint
        });
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
      console.error("Error stack:", error.stack);
      
      // More specific error handling
      if (error.message?.includes('JWT')) {
        console.error("🔐 Authentication issue detected");
        toast.error("Authentication issue - please sign in again");
      } else if (error.code === 'PGRST116') {
        console.error("🚫 RLS policy blocking access");
        toast.error("Access denied - you may not be a member of this group");
      } else if (error.message?.includes('Membership check failed')) {
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
    
    // For newly created groups, add a small delay to ensure database consistency
    const timeoutId = setTimeout(() => {
      fetchGroupDetails();
    }, 50); // Reduced delay since Edge Function now confirms membership
    
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
