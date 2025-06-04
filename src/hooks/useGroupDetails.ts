
import { User } from '@/types/auth';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useGroupInvites } from '@/hooks/useGroupInvites';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupExpenses } from '@/hooks/useGroupExpenses';
import { useGroupPotMetrics } from '@/hooks/useGroupPotMetrics';
import { useState, useEffect } from 'react';

export const useGroupDetails = (id: string | undefined, user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Use the extracted hooks
  const { group, loading, refreshData, membership } = useGroupData(id, user);
  const { members } = useGroupMembers(id);
  const { inviteMember } = useGroupInvites(id);
  const { expenses, totalExpenses } = useGroupExpenses(id, user);
  const { potBalance, pendingPayoutsCount, connectedWalletsCount } = useGroupPotMetrics(id);

  // Set admin status based on membership data from Edge Function
  useEffect(() => {
    console.log("[GROUP DETAILS] Setting admin status from membership:", membership);
    if (membership?.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [membership]);

  // Wrapper for inviteMember to provide user ID
  const handleInviteMember = async (inviteEmail: string) => {
    if (!user) throw new Error("User not authenticated");
    return inviteMember(inviteEmail, user.id);
  };

  const handleMemberAdded = async () => {
    console.log("[GROUP DETAILS] Member added, refreshing data");
    await refreshData();
  };

  console.log("[GROUP DETAILS] Current state:", {
    groupId: id,
    isAdmin,
    membership,
    membersCount: members?.length || 0
  });

  return {
    group,
    members,
    loading,
    isAdmin,
    inviteMember: handleInviteMember,
    refreshData,
    handleMemberAdded,
    potBalance,
    totalExpenses,
    pendingPayoutsCount,
    connectedWalletsCount,
    expenses
  };
};
