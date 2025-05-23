
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { PotActivity } from '@/types/group-pot';
import { 
  approvePayoutRequest, 
  rejectPayoutRequest 
} from '@/services/groupPotService';

interface PulsePayoutsData {
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
}

export const usePulsePayouts = (
  groupId: string,
  setActivities: React.Dispatch<React.SetStateAction<PotActivity[]>>,
  pendingRequests: PotActivity[],
  setPendingRequests: React.Dispatch<React.SetStateAction<PotActivity[]>>
): PulsePayoutsData => {
  
  const handleApproveRequest = async (activityId: string) => {
    try {
      await approvePayoutRequest(activityId);
      
      toast.success('Payout request approved');
      
      // Update the activity in the activities state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'approved' } 
            : activity
        )
      );
      
      // Remove the approved request from the pending requests
      setPendingRequests(prev => 
        prev.filter(request => request.id !== activityId)
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
      
      // Update the activity in the activities state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'rejected' } 
            : activity
        )
      );
      
      // Remove the rejected request from the pending requests
      setPendingRequests(prev => 
        prev.filter(request => request.id !== activityId)
      );
    } catch (error) {
      console.error('Error rejecting payout request:', error);
      toast.error('Failed to reject payout request');
    }
  };
  
  return {
    handleApproveRequest,
    handleRejectRequest
  };
};
