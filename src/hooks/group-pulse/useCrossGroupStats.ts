
import { useState, useEffect } from 'react';
import { Group } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { fetchGroupPotActivities } from '@/services/groupPotService';
import { 
  calculatePotBalance, 
  countPendingPayouts 
} from '@/utils/groupPulseUtils';

export interface GroupComparison {
  id: string;
  name: string;
  membersCount: number;
  potBalance: number;
  pendingPayouts: number;
}

export interface AllGroupsStats {
  totalGroups: number;
  totalPotBalance: number;
  totalPendingPayouts: number;
  groupComparisons: GroupComparison[];
}

interface CrossGroupStatsData {
  allGroupsStats: AllGroupsStats | null;
}

export const useCrossGroupStats = (groups: Group[]): CrossGroupStatsData => {
  const [allGroupsStats, setAllGroupsStats] = useState<AllGroupsStats | null>(null);
  
  useEffect(() => {
    const fetchCrossGroupStats = async () => {
      try {
        if (groups.length === 0) return;
        
        const groupComparisons: GroupComparison[] = [];
        let totalPotBalance = 0;
        let totalPendingPayouts = 0;
        
        // For each group, fetch members count and pot activities
        for (const group of groups) {
          // Get members count
          const { data: members } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', group.id);
            
          // Get pot activities for the group
          const activities = await fetchGroupPotActivities(group.id);
          
          // Calculate pot balance and pending payouts
          const potBalance = calculatePotBalance(activities);
          const pendingPayouts = countPendingPayouts(activities);
          
          // Add to totals
          totalPotBalance += potBalance;
          totalPendingPayouts += pendingPayouts;
          
          // Add to group comparisons
          groupComparisons.push({
            id: group.id,
            name: group.name,
            membersCount: members?.length || 0,
            potBalance,
            pendingPayouts
          });
        }
        
        // Set all groups stats
        setAllGroupsStats({
          totalGroups: groups.length,
          totalPotBalance,
          totalPendingPayouts,
          groupComparisons
        });
      } catch (error) {
        console.error('Error fetching cross-group statistics:', error);
      }
    };
    
    fetchCrossGroupStats();
  }, [groups]);
  
  return { allGroupsStats };
};
