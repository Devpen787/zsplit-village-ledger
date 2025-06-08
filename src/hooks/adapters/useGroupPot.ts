
import { useState, useEffect, useCallback } from 'react';
import { storageAdapter } from '@/adapters';
import { PotActivity } from '@/adapters/types';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';

export const useGroupPotActivities = (groupId: string) => {
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActivities = useCallback(async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      const data = await storageAdapter.getPotActivities(groupId);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching pot activities:', error);
      toast.error('Failed to load pot activities');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const handleContribute = useCallback(async (amount: number, note: string) => {
    if (!user || !groupId) return;
    
    try {
      await storageAdapter.createPotActivity({
        group_id: groupId,
        user_id: user.id,
        type: 'contribution',
        amount,
        note,
        status: 'complete'
      });
      
      await fetchActivities();
      toast.success('Contribution added successfully');
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast.error('Failed to add contribution');
    }
  }, [user, groupId, fetchActivities]);

  const handlePayoutRequest = useCallback(async (amount: number, note: string) => {
    if (!user || !groupId) return;
    
    try {
      await storageAdapter.createPotActivity({
        group_id: groupId,
        user_id: user.id,
        type: 'payout',
        amount,
        note,
        status: 'pending'
      });
      
      await fetchActivities();
      toast.success('Payout request submitted');
    } catch (error) {
      console.error('Error submitting payout request:', error);
      toast.error('Failed to submit payout request');
    }
  }, [user, groupId, fetchActivities]);

  const handleApproveRequest = useCallback(async (activityId: string) => {
    try {
      await storageAdapter.updatePotActivity(activityId, { status: 'approved' });
      await fetchActivities();
      toast.success('Request approved');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  }, [fetchActivities]);

  const handleRejectRequest = useCallback(async (activityId: string) => {
    try {
      await storageAdapter.updatePotActivity(activityId, { status: 'rejected' });
      await fetchActivities();
      toast.success('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  }, [fetchActivities]);

  useEffect(() => {
    if (groupId) {
      fetchActivities();
      
      // Set up real-time subscription
      const unsubscribe = storageAdapter.subscribeToChanges(
        'group_pot_activity',
        () => fetchActivities(),
        `group_id=eq.${groupId}`
      );

      return unsubscribe;
    }
  }, [groupId, fetchActivities]);

  return {
    activities,
    loading,
    handleContribute,
    handlePayoutRequest,
    handleApproveRequest,
    handleRejectRequest,
    refetch: fetchActivities
  };
};
