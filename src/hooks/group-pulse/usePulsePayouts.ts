
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { 
  approvePayoutRequest, 
  rejectPayoutRequest 
} from '@/services/groupPotService';

interface PulsePayoutsData {
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
}

export const usePulsePayouts = (
  activities: PotActivity[],
  setActivities: React.Dispatch<React.SetStateAction<PotActivity[]>>,
  setPendingRequests: React.Dispatch<React.SetStateAction<PotActivity[]>>
): PulsePayoutsData => {
  const handleApproveRequest = async (activityId: string) => {
    try {
      await approvePayoutRequest(activityId);
      
      toast.success('Payout request approved');
      
      // Update the activities in state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'approved' } 
            : activity
        )
      );
      
      // Update pending requests
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== activityId)
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
      
      // Update the activities in state
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'rejected' } 
            : activity
        )
      );
      
      // Update pending requests
      setPendingRequests(prevRequests => 
        prevRequests.filter(request => request.id !== activityId)
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
