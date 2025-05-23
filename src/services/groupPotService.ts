
import { supabase } from "@/integrations/supabase/client";
import { PotActivity } from '@/types/group-pot';
import { toast } from '@/components/ui/sonner';

/**
 * Fetches all pot activities for a specific group
 */
export const fetchGroupPotActivities = async (groupId: string) => {
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
      users:user_id (id, name, email, wallet_address)
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

  return typedActivities as PotActivity[];
};

/**
 * Checks if a user is an admin for a specific group
 */
export const checkUserIsAdmin = async (groupId: string, userId: string) => {
  const { data: memberData } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
  
  return memberData?.role === 'admin';
};

/**
 * Submits a payout request to the group pot
 */
export const submitPayoutRequest = async (
  groupId: string,
  userId: string,
  amount: number,
  note: string,
  userName: string | null | undefined,
  userEmail: string
) => {
  const { data, error } = await supabase
    .from('group_pot_activity')
    .insert({
      group_id: groupId,
      user_id: userId,
      amount,
      note,
      type: 'payout',
      status: 'pending'
    })
    .select();
    
  if (error) throw error;
  
  // Get user wallet address
  const { data: userData } = await supabase
    .from('users')
    .select('wallet_address')
    .eq('id', userId)
    .single();

  // Return formatted activity
  if (data && data[0]) {
    return {
      ...data[0],
      type: 'payout' as const,
      status: 'pending' as const,
      users: { 
        id: userId,
        name: userName, 
        email: userEmail,
        wallet_address: userData?.wallet_address
      }
    } as PotActivity;
  }

  return null;
};

/**
 * Adds a contribution to the group pot
 */
export const addContribution = async (
  groupId: string,
  userId: string,
  amount: number,
  note: string,
  userName: string | null | undefined,
  userEmail: string
) => {
  const { data, error } = await supabase
    .from('group_pot_activity')
    .insert({
      group_id: groupId,
      user_id: userId,
      amount,
      note: note || 'Contribution to group pot',
      type: 'contribution',
      status: 'complete'
    })
    .select();
    
  if (error) throw error;
  
  // Get user wallet address
  const { data: userData } = await supabase
    .from('users')
    .select('wallet_address')
    .eq('id', userId)
    .single();
  
  // Return formatted activity
  if (data && data[0]) {
    return {
      ...data[0],
      type: 'contribution' as const,
      status: 'complete' as const,
      users: { 
        id: userId,
        name: userName, 
        email: userEmail,
        wallet_address: userData?.wallet_address
      }
    } as PotActivity;
  }

  return null;
};

/**
 * Approves a payout request
 */
export const approvePayoutRequest = async (activityId: string) => {
  console.log("Approving request:", activityId);
  const { error } = await supabase
    .from('group_pot_activity')
    .update({ status: 'approved' })
    .eq('id', activityId);

  if (error) throw error;
};

/**
 * Rejects a payout request
 */
export const rejectPayoutRequest = async (activityId: string) => {
  console.log("Rejecting request:", activityId);
  const { error } = await supabase
    .from('group_pot_activity')
    .update({ status: 'rejected' })
    .eq('id', activityId);

  if (error) throw error;
};

/**
 * Updates the target amount for a group pot
 * Note: This is currently a mock implementation since we don't have a table for storing the target amount
 */
export const updateTargetAmount = async (groupId: string, amount: number) => {
  // In a real implementation, this would save to the database
  // For now, just log the change
  console.log(`Updated target amount for group ${groupId} to ${amount}`);
  
  // Return true to indicate success
  return true;
};
