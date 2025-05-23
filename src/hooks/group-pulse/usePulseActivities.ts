
import { useState, useEffect } from 'react';
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { fetchGroupPotActivities } from '@/services/groupPotService';
import { calculateRemainingBalance } from '@/utils/groupPotUtils';

export interface PulseActivitiesData {
  activities: PotActivity[];
  pendingRequests: PotActivity[];
  recentActivities: PotActivity[];
  potBalance: number;
  loading: boolean;
  setActivities: React.Dispatch<React.SetStateAction<PotActivity[]>>;
  setPendingRequests: React.Dispatch<React.SetStateAction<PotActivity[]>>;
}

export const usePulseActivities = (groupId: string): PulseActivitiesData => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PotActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<PotActivity[]>([]);
  const [potBalance, setPotBalance] = useState(0);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch group pot activities
        const typedActivities = await fetchGroupPotActivities(groupId);
        
        // Calculate pot balance
        const balance = calculateRemainingBalance(typedActivities);
        
        // Get pending requests - payout activities with "pending" status
        const pending = typedActivities.filter(
          activity => activity.type === 'payout' && activity.status === 'pending'
        );
        
        // Get recent activities - most recent 5 activities
        const recent = [...typedActivities].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5);
        
        setActivities(typedActivities);
        setPotBalance(balance);
        setPendingRequests(pending);
        setRecentActivities(recent);
      } catch (error) {
        console.error('Error fetching group pulse data:', error);
        toast.error('Failed to load group pulse data');
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
    pendingRequests,
    recentActivities,
    potBalance,
    loading,
    setActivities,
    setPendingRequests
  };
};
