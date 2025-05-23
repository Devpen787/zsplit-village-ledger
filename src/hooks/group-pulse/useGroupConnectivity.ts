
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GroupConnectivityData {
  connectedWalletsCount: number;
  totalMembersCount: number;
}

export const useGroupConnectivity = (groupId: string): GroupConnectivityData => {
  const [connectedWalletsCount, setConnectedWalletsCount] = useState(0);
  const [totalMembersCount, setTotalMembersCount] = useState(0);
  
  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        // Fetch group members with wallet info
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('user_id, users:user_id(wallet_address)')
          .eq('group_id', groupId);
          
        if (membersError) throw membersError;
        
        if (members) {
          const totalMembers = members.length;
          const withWallets = members.filter(m => m.users?.wallet_address).length;
          setConnectedWalletsCount(withWallets);
          setTotalMembersCount(totalMembers);
        }
      } catch (error) {
        console.error('Error fetching group members:', error);
      }
    };
    
    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);
  
  return {
    connectedWalletsCount,
    totalMembersCount
  };
};
