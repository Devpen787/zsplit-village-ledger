
import { useState } from 'react';
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts';
import { addContribution } from '@/services/groupPotService';

interface PotContributionsData {
  handleContribute: (amount: number, note: string) => Promise<void>;
}

export const usePotContributions = (
  groupId: string,
  activities: PotActivity[],
  setActivities: React.Dispatch<React.SetStateAction<PotActivity[]>>,
  setTotalContributions: React.Dispatch<React.SetStateAction<number>>,
  contributors: {id: string; name?: string | null}[],
  setContributors: React.Dispatch<React.SetStateAction<{id: string; name?: string | null}[]>>
): PotContributionsData => {
  const { user } = useAuth();
  
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
  
  return { handleContribute };
};
