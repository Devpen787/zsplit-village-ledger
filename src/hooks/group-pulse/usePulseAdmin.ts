
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { checkUserIsAdmin } from '@/services/groupPotService';

interface PulseAdminData {
  isAdmin: boolean;
}

export const usePulseAdmin = (groupId: string): PulseAdminData => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const admin = await checkUserIsAdmin(groupId, user.id);
        setIsAdmin(admin);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    if (groupId && user) {
      checkAdminStatus();
    }
  }, [groupId, user]);
  
  return { isAdmin };
};
