
import { PotActivity } from '@/types/group-pot';

/**
 * Calculates total contributions from activities
 */
export const calculateTotalContributions = (activities: PotActivity[]): number => {
  let total = 0;
  activities.forEach((activity) => {
    if (activity.type === 'contribution' && activity.status === 'complete') {
      total += activity.amount;
    }
  });
  return total;
};

/**
 * Extract unique contributors from activities
 */
export const extractContributors = (activities: PotActivity[]): {id: string; name?: string | null}[] => {
  const uniqueContributors = new Map();
  
  activities.forEach((activity: PotActivity) => {
    if (activity.type === 'contribution' && activity.status === 'complete') {
      // Track unique contributors
      if (!uniqueContributors.has(activity.user_id)) {
        uniqueContributors.set(activity.user_id, {
          id: activity.user_id,
          name: activity.users?.name
        });
      }
    }
  });
  
  return Array.from(uniqueContributors.values());
};
