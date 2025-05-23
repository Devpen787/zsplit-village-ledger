
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';
import { 
  submitPayoutRequest, 
  approvePayoutRequest, 
  rejectPayoutRequest 
} from '@/services/groupPotService';

interface PotPayoutsData {
  handlePayoutRequest: (amount: number, note: string) => Promise<void>;
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
}

export const usePotPayouts = (
  groupId: string,
  activities: PotActivity[],
  setActivities: React.Dispatch<React.SetStateAction<PotActivity[]>>
): PotPayoutsData => {
  const { user } = useAuth();
  
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
    handlePayoutRequest,
    handleApproveRequest,
    handleRejectRequest
  };
};
