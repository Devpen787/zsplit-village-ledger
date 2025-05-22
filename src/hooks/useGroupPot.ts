
import { useState, useEffect } from 'react';
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';
import {
  fetchGroupPotActivities,
  checkUserIsAdmin,
  submitPayoutRequest,
  addContribution,
  approvePayoutRequest,
  rejectPayoutRequest
} from '@/services/groupPotService';
import {
  calculateTotalContributions,
  extractContributors
} from '@/utils/groupPotUtils';

interface GroupPotData {
  activities: PotActivity[];
  totalContributions: number;
  contributors: {id: string; name?: string | null}[];
  loading: boolean;
  handlePayoutRequest: (amount: number, note: string) => Promise<void>;
  handleContribute: (amount: number, note: string) => Promise<void>;
  isAdmin: boolean;
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
}

export const useGroupPot = (groupId: string): GroupPotData => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [contributors, setContributors] = useState<{id: string; name?: string | null}[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  
  // Load group pot data
  useEffect(() => {
    const fetchGroupPotData = async () => {
      try {
        setLoading(true);
        
        // Fetch group pot activities
        const typedActivities = await fetchGroupPotActivities(groupId);
        
        // Calculate total contributions and extract contributors
        const total = calculateTotalContributions(typedActivities);
        const uniqueContributors = extractContributors(typedActivities);
        
        console.log("Total contributions:", total);
        console.log("Unique contributors:", uniqueContributors);
        
        setActivities(typedActivities);
        setTotalContributions(total);
        setContributors(uniqueContributors);

        // Check if current user is an admin
        if (user) {
          const admin = await checkUserIsAdmin(groupId, user.id);
          setIsAdmin(admin);
        }
      } catch (error) {
        console.error('Error fetching group pot data:', error);
        toast.error('Failed to load group pot data');
      } finally {
        setLoading(false);
      }
    };
    
    if (groupId) {
      fetchGroupPotData();
    }
  }, [groupId, user]);
  
  const handlePayoutRequest = async (amount: number, note: string) => {
    if (!user) return;
    
    try {
      const newActivity = await submitPayoutRequest(
        groupId,
        user.id,
        amount,
        note,
        user.name,
        user.email
      );
      
      toast.success('Payout request submitted successfully');
      
      // Update activities with the new request
      if (newActivity) {
        setActivities([newActivity, ...activities]);
      }
    } catch (error) {
      console.error('Error submitting payout request:', error);
      toast.error('Failed to submit payout request');
    }
  };
  
  const handleContribute = async (amount: number, note: string) => {
    if (!user) return;
    
    try {
      const newActivity = await addContribution(
        groupId,
        user.id,
        amount,
        note,
        user.name,
        user.email
      );
      
      toast.success('Contribution added successfully');
      
      // Update state
      if (newActivity) {
        // Add to activities
        setActivities([newActivity, ...activities]);
        
        // Update total contributions
        setTotalContributions(prevTotal => prevTotal + amount);
        
        // Update contributors if new
        if (!contributors.some(c => c.id === user.id)) {
          setContributors([...contributors, { 
            id: user.id, 
            name: user.name 
          }]);
        }
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution');
    }
  };

  const handleApproveRequest = async (activityId: string) => {
    try {
      await approvePayoutRequest(activityId);
      
      toast.success('Payout request approved');
      
      // Update the activity in state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'approved' } 
            : activity
        )
      );
    } catch (error) {
      console.error('Error approving payout request:', error);
      toast.error('Failed to approve payout request');
    }
  };

  const handleRejectRequest = async (activityId: string) => {
    try {
      await rejectPayoutRequest(activityId);
      
      toast.success('Payout request rejected');
      
      // Update the activity in state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'rejected' } 
            : activity
        )
      );
    } catch (error) {
      console.error('Error rejecting payout request:', error);
      toast.error('Failed to reject payout request');
    }
  };
  
  return {
    activities,
    totalContributions,
    contributors,
    loading,
    handlePayoutRequest,
    handleContribute,
    isAdmin,
    handleApproveRequest,
    handleRejectRequest
  };
};
