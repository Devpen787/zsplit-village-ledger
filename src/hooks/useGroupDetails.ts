
import { User } from '@/types/auth';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useGroupInvites } from '@/hooks/useGroupInvites';
import { useGroupAdminStatus } from '@/hooks/useGroupAdminStatus';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupExpenses } from '@/hooks/useGroupExpenses';
import { useGroupPotMetrics } from '@/hooks/useGroupPotMetrics';

export const useGroupDetails = (id: string | undefined, user: User | null) => {
  // Use the extracted hooks
  const { group, loading, refreshData } = useGroupData(id, user);
  const { members } = useGroupMembers(id);
  const { inviteMember } = useGroupInvites(id);
  const { isAdmin } = useGroupAdminStatus(id, user);
  const { expenses, totalExpenses } = useGroupExpenses(id, user);
  const { potBalance, pendingPayoutsCount, connectedWalletsCount } = useGroupPotMetrics(id);

  // Wrapper for inviteMember to provide user ID
  const handleInviteMember = async (inviteEmail: string) => {
    if (!user) throw new Error("User not authenticated");
    return inviteMember(inviteEmail, user.id);
  };

  return {
    group,
    members,
    loading,
    isAdmin,
    inviteMember: handleInviteMember,
    refreshData,
    potBalance,
    totalExpenses,
    pendingPayoutsCount,
    connectedWalletsCount,
    expenses
  };
};
