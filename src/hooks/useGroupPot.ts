
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';

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
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('group_pot_activity')
          .select(`
            id,
            amount,
            note,
            type,
            status,
            created_at,
            user_id,
            group_id,
            users:user_id (name, email)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });
          
        if (activitiesError) throw activitiesError;
        
        console.log("Fetched activities:", activitiesData);
        
        // Ensure data conforms to PotActivity type
        const typedActivities = activitiesData.map(activity => ({
          ...activity,
          type: activity.type as 'contribution' | 'payout',
          status: activity.status as 'pending' | 'approved' | 'complete' | 'rejected' | null
        }));
        
        // Calculate total contributions
        let total = 0;
        const uniqueContributors = new Map();
        
        typedActivities.forEach((activity: PotActivity) => {
          if (activity.type === 'contribution' && activity.status === 'complete') {
            total += activity.amount;
            
            // Track unique contributors
            if (!uniqueContributors.has(activity.user_id)) {
              uniqueContributors.set(activity.user_id, {
                id: activity.user_id,
                name: activity.users?.name
              });
            }
          }
        });
        
        console.log("Total contributions:", total);
        console.log("Unique contributors:", Array.from(uniqueContributors.values()));
        
        setActivities(typedActivities);
        setTotalContributions(total);
        setContributors(Array.from(uniqueContributors.values()));

        // Check if current user is an admin
        if (user) {
          const { data: memberData } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .single();
          
          setIsAdmin(memberData?.role === 'admin');
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
      const { data, error } = await supabase
        .from('group_pot_activity')
        .insert({
          group_id: groupId,
          user_id: user.id,
          amount,
          note,
          type: 'payout',
          status: 'pending'
        })
        .select();
        
      if (error) throw error;
      
      toast.success('Payout request submitted successfully');
      
      // Update activities with the new request
      if (data && data[0]) {
        const newActivity: PotActivity = {
          ...data[0],
          type: 'payout',
          status: 'pending',
          users: { 
            name: user.name || null, 
            email: user.email 
          }
        };
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
      const { data, error } = await supabase
        .from('group_pot_activity')
        .insert({
          group_id: groupId,
          user_id: user.id,
          amount,
          note: note || 'Contribution to group pot',
          type: 'contribution',
          status: 'complete'
        })
        .select();
        
      if (error) throw error;
      
      toast.success('Contribution added successfully');
      
      // Update state
      if (data && data[0]) {
        // Add to activities
        const newActivity: PotActivity = {
          ...data[0],
          type: 'contribution',
          status: 'complete',
          users: { 
            name: user.name || null, 
            email: user.email 
          }
        };
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
      console.log("Approving request:", activityId);
      const { error } = await supabase
        .from('group_pot_activity')
        .update({ status: 'approved' })
        .eq('id', activityId);

      if (error) throw error;
      
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
      console.log("Rejecting request:", activityId);
      const { error } = await supabase
        .from('group_pot_activity')
        .update({ status: 'rejected' })
        .eq('id', activityId);

      if (error) throw error;
      
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
