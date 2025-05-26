
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGroupPotMetrics = (id: string | undefined) => {
  const [potBalance, setPotBalance] = useState(0);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState(0);
  const [connectedWalletsCount, setConnectedWalletsCount] = useState(0);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchPotMetrics = async () => {
      try {
        // Fetch pot balance and other metrics from group_pot_activity table
        const { data: activities, error } = await supabase
          .from('group_pot_activity')
          .select('*')
          .eq('group_id', id);
          
        if (error) throw error;
        
        // Calculate pot balance from activities
        let balance = 0;
        let pending = 0;
        
        if (activities) {
          // Calculate balance
          balance = activities.reduce((bal, activity) => {
            if (activity.type === 'contribution' && activity.status === 'complete') {
              return bal + Number(activity.amount || 0);
            } else if (activity.type === 'payout' && 
                      (activity.status === 'approved' || activity.status === 'complete')) {
              return bal - Number(activity.amount || 0);
            }
            return bal;
          }, 0);
          
          // Count pending payouts
          pending = activities.filter(
            activity => activity.type === 'payout' && activity.status === 'pending'
          ).length;
        }
        
        // Fetch wallet connection data
        const { data: groupMembers, error: membersError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', id);
          
        if (membersError) throw membersError;
        
        // Get all users with connected wallets
        const { data: connectedUsers, error: usersError } = await supabase
          .from('users')
          .select('id, wallet_address')
          .not('wallet_address', 'is', null);
          
        if (usersError) throw usersError;
        
        // Count members with connected wallets
        const connectedCount = groupMembers?.filter(member => 
          connectedUsers?.some(user => 
            user.id === member.user_id && user.wallet_address
          )
        ).length || 0;
        
        setPotBalance(balance);
        setPendingPayoutsCount(pending);
        setConnectedWalletsCount(connectedCount);
        
      } catch (error: any) {
        console.error("Error fetching pot metrics:", error);
      }
    };
    
    fetchPotMetrics();
  }, [id]);

  return {
    potBalance,
    pendingPayoutsCount,
    connectedWalletsCount
  };
};
