
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export const useGroupAdminStatus = (groupId: string | undefined, user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (!groupId || !user) return;
    
    checkAdminStatus();
  }, [groupId, user]);

  const checkAdminStatus = async () => {
    if (!groupId || !user) return;
    
    try {
      // Check if current user is an admin
      const { data: memberData, error: memberError } = await (supabase
        .from('group_members') as any)
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();
        
      if (!memberError && memberData) {
        setIsAdmin(memberData.role === 'admin');
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  return { isAdmin };
};
