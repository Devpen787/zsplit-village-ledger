
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts';
import { PotContributionsCard } from './PotContributionsCard';
import { PotActivityFeed } from './PotActivityFeed';
import { RequestPayoutForm } from './RequestPayoutForm';
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

interface GroupPotProps {
  groupId: string;
}

export const GroupPot = ({ groupId }: GroupPotProps) => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<PotActivity[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [targetAmount, setTargetAmount] = useState(300); // Example target amount
  const [contributors, setContributors] = useState<{id: string; name?: string | null}[]>([]);
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
        
        setActivities(typedActivities);
        setTotalContributions(total);
        setContributors(Array.from(uniqueContributors.values()));
      } catch (error) {
        console.error('Error fetching group pot data:', error);
        toast.error('Failed to load group pot data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupPotData();
  }, [groupId]);
  
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
          status: 'pending', // Explicitly cast to one of the allowed status values
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
          status: 'complete', // Explicitly cast to one of the allowed status values
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PotContributionsCard 
        totalContributions={totalContributions} 
        targetAmount={targetAmount} 
        contributors={contributors}
        onContribute={handleContribute}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <RequestPayoutForm onSubmit={handlePayoutRequest} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Group Pot Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <PotActivityFeed activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
};
