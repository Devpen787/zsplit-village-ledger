
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
  
  // Helper function to check membership with retries
  const checkMembershipWithRetry = async (groupId: string, userId: string, maxRetries = 5): Promise<boolean> => {
    console.log(`🔄 Checking membership for group ${groupId}, attempt 1 of ${maxRetries}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const membershipCheck = await makeAuthenticatedRequest(userId, async () => {
          return await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .maybeSingle();
        });
        
        if (membershipCheck.error) {
          console.error(`❌ Membership check error (attempt ${attempt}):`, membershipCheck.error);
          if (attempt === maxRetries) {
            throw new Error(`Membership check failed: ${membershipCheck.error.message}`);
          }
        } else if (membershipCheck.data) {
          console.log(`✅ Membership confirmed on attempt ${attempt}:`, membershipCheck.data.role);
          return true;
        } else {
          console.log(`⏳ No membership found on attempt ${attempt}, retrying...`);
        }
        
        // Wait before retrying (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`💥 Error during membership check attempt ${attempt}:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    console.log(`❌ Membership not found after ${maxRetries} attempts`);
    return false;
  };
  
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
      
      // First, check membership with retry mechanism
      console.log("👥 Checking user membership with retry logic...");
      const isMember = await checkMembershipWithRetry(id, user.id);
      
      if (!isMember) {
        console.log("❌ User is not a member of this group after retries");
        toast.error("You are not a member of this group");
        navigate('/group');
        return;
      }
      
      console.log("✅ User membership confirmed, fetching group data...");
      
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
