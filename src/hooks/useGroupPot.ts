
import { useState } from 'react';
import { PotActivity } from '@/types/group-pot';
import { usePotActivities } from './group-pot/usePotActivities';
import { usePotAdmin } from './group-pot/usePotAdmin';
import { usePotContributions } from './group-pot/usePotContributions';
import { usePotPayouts } from './group-pot/usePotPayouts';
import { usePotTarget } from './group-pot/usePotTarget';

interface GroupPotData {
  activities: PotActivity[];
  totalContributions: number;
  remainingBalance: number;
  targetAmount: number;
  setTargetAmount: (amount: number) => void;
  contributors: {id: string; name?: string | null}[];
  loading: boolean;
  handlePayoutRequest: (amount: number, note: string) => Promise<void>;
  handleContribute: (amount: number, note: string) => Promise<void>;
  isAdmin: boolean;
  handleApproveRequest: (activityId: string) => Promise<void>;
  handleRejectRequest: (activityId: string) => Promise<void>;
}

export const useGroupPot = (groupId: string): GroupPotData => {
  // Get activities, contributions, and balances
  const { 
    activities, 
    setActivities = useState<PotActivity[]>([])[1],
    totalContributions, 
    setTotalContributions = useState(0)[1],
    remainingBalance, 
    contributors, 
    setContributors = useState<{id: string; name?: string | null}[]>([])[1],
    loading 
  } = usePotActivities(groupId);
  
  // Get admin status
  const { isAdmin } = usePotAdmin(groupId);
  
  // Get target amount control
  const { targetAmount, setTargetAmount } = usePotTarget(isAdmin);
  
  // Get contribution controls
  const { handleContribute } = usePotContributions(
    groupId, 
    activities, 
    setActivities, 
    setTotalContributions, 
    contributors, 
    setContributors
  );
  
  // Get payout controls
  const { 
    handlePayoutRequest, 
    handleApproveRequest, 
    handleRejectRequest 
  } = usePotPayouts(groupId, activities, setActivities);
  
  return {
    activities,
    totalContributions,
    remainingBalance,
    targetAmount,
    setTargetAmount,
    contributors,
    loading,
    handlePayoutRequest,
    handleContribute,
    isAdmin,
    handleApproveRequest,
    handleRejectRequest
  };
};
