
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
      
      // Use authenticated request wrapper to ensure proper auth context
      const response = await makeAuthenticatedRequest(user.id, async () => {
        console.log("📡 Making Supabase request for group:", id);
        return await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .maybeSingle();
      });
      
      console.log("📥 Supabase response:", response);
        
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
        console.log("This means the group exists but RLS is blocking access");
        
        // Let's also check if the user is a member of this group
        const memberCheck = await makeAuthenticatedRequest(user.id, async () => {
          console.log("🔍 Checking group membership for user:", user.id, "in group:", id);
          return await supabase
            .from('group_members')
            .select('*')
            .eq('group_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
        });
        
        console.log("👥 Group membership check result:", memberCheck);
        
        if (memberCheck.error) {
          console.error("❌ Error checking membership:", memberCheck.error);
        }
        
        if (!memberCheck.data) {
          console.log("❌ User is not a member of this group");
          toast.error("You are not a member of this group");
        } else {
          console.log("✅ User is a member, but group data is not accessible - possible RLS issue");
          toast.error("Group access issue - please try refreshing the page");
        }
        
        navigate('/group');
        return;
      }
      
      console.log("✅ Group data found:", response.data);
      setGroup(response.data);
      
    } catch (error: any) {
      console.error("💥 Error fetching group:", error);
      console.error("Error stack:", error.stack);
      
      // More specific error handling
      if (error.message?.includes('JWT')) {
        console.error("🔐 Authentication issue detected");
        toast.error("Authentication issue - please sign in again");
      } else if (error.code === 'PGRST116') {
        console.error("🚫 RLS policy blocking access");
        toast.error("Access denied - you may not be a member of this group");
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
    
    // Add a small delay for newly created groups to ensure database consistency
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
