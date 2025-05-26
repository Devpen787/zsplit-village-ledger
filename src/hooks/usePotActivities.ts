
import { useState, useEffect } from 'react';
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { fetchGroupPotActivities } from '@/services/groupPotService';
import {
  calculateTotalContributions,
  calculateRemainingBalance,
  extractContributors
} from '@/utils/groupPotUtils';

export interface PotActivitiesData {
  activities: PotActivity[];
  totalContributions: number;
  remainingBalance: number;
  contributors: {id: string; name?: string | null}[];
  loading: boolean;
  setActivities: React.Dispatch<React.SetStateAction<PotActivity[]>>;
  setTotalContributions: React.Dispatch<React.SetStateAction<number>>;
  setContributors: React.Dispatch<React.SetStateAction<{id: string; name?: string | null}[]>>;
}

export const usePotActivities = (groupId: string): PotActivitiesData => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [contributors, setContributors] = useState<{id: string; name?: string | null}[]>([]);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch group pot activities - this should now work without RLS issues
        const typedActivities = await fetchGroupPotActivities(groupId);
        
        // Calculate total contributions, remaining balance, and extract contributors
        const total = calculateTotalContributions(typedActivities);
        const remaining = calculateRemainingBalance(typedActivities);
        const uniqueContributors = extractContributors(typedActivities);
        
        console.log("Total contributions:", total);
        console.log("Remaining balance:", remaining);
        console.log("Unique contributors:", uniqueContributors);
        
        setActivities(typedActivities);
        setTotalContributions(total);
        setRemainingBalance(remaining);
        setContributors(uniqueContributors);
      } catch (error) {
        console.error('Error fetching group pot data:', error);
        toast.error('Failed to load group pot data');
      } finally {
        setLoading(false);
      }
    };
    
    if (groupId) {
      fetchActivities();
    }
  }, [groupId]);
  
  return {
    activities,
    totalContributions,
    remainingBalance,
    contributors,
    loading,
    setActivities,
    setTotalContributions,
    setContributors
  };
};
