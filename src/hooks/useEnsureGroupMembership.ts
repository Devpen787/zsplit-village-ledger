
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export const useEnsureGroupMembership = (groupId: string | undefined, user: User | null) => {
  useEffect(() => {
    const ensureMembership = async () => {
      if (!groupId || !user) return;
      
      console.log("[ENSURE MEMBERSHIP] Checking membership for user:", user.id, "in group:", groupId);
      
      try {
        // Check if user is already a member
        const { data: existingMembership, error: membershipError } = await supabase
          .from('group_members')
          .select('id, role')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (membershipError) {
          console.error("[ENSURE MEMBERSHIP] Error checking membership:", membershipError);
          return;
        }
        
        if (!existingMembership) {
          console.log("[ENSURE MEMBERSHIP] User is not a member, adding via Edge Function");
          
          // Use the Edge Function to add the user to the group
          const result = await supabase.functions.invoke('create-user', {
            body: {
              user_id: user.id,
              user_email: user.email,
              user_name: user.name,
              group_id: groupId
            }
          });

          if (result.error) {
            console.error("[ENSURE MEMBERSHIP] Error from Edge Function:", result.error);
          } else {
            console.log("[ENSURE MEMBERSHIP] Successfully ensured user membership");
          }
        } else {
          console.log("[ENSURE MEMBERSHIP] User is already a member with role:", existingMembership.role);
        }
      } catch (error) {
        console.error("[ENSURE MEMBERSHIP] Unexpected error:", error);
      }
    };
    
    ensureMembership();
  }, [groupId, user]);
};
