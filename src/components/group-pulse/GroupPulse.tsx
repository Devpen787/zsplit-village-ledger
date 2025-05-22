
import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { IntroCard } from './IntroCard';
import { PotBalanceCard } from './PotBalanceCard';
import { ExpensesStatusCard } from './ExpensesStatusCard';
import { PotHealthCard } from './PotHealthCard';
import { RecentActivityCard } from './RecentActivityCard';
import { GroupConnectivityCard } from './GroupConnectivityCard';
import { PayoutRequestsCard } from './PayoutRequestsCard';
import { PendingRequestsSection } from './PendingRequestsSection';

export const GroupPulse = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const {
    loading,
    potBalance,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    pendingPayoutsCount,
    averageApprovalTime,
    pendingRequests,
    connectedWalletsCount,
    totalMembersCount,
    handleApproveRequest,
    handleRejectRequest,
    isAdmin
  } = useGroupPulse(groupId);

  return (
    <div className="grid gap-6">
      {/* Introduction Card */}
      <IntroCard />

      {/* Financial metrics shown to all users regardless of wallet connection */}
      <div className="grid gap-6 md:grid-cols-2">
        <PotBalanceCard potBalance={potBalance} />
        <ExpensesStatusCard potBalance={potBalance} loading={loading} />
      </div>
      
      {/* Pot Health and Activity metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <PotHealthCard 
          averagePayoutSize={averagePayoutSize} 
          estimatedPayoutsRemaining={estimatedPayoutsRemaining} 
        />
        <RecentActivityCard 
          recentExpensesCount={recentExpensesCount} 
          latestExpenseDate={latestExpenseDate} 
        />
      </div>
      
      {/* Group connectivity status */}
      <div className="grid gap-6 md:grid-cols-2">
        <GroupConnectivityCard 
          connectedWalletsCount={connectedWalletsCount} 
          totalMembersCount={totalMembersCount} 
        />
        <PayoutRequestsCard 
          pendingPayoutsCount={pendingPayoutsCount} 
          averageApprovalTime={averageApprovalTime} 
        />
      </div>

      {/* Pending payout requests list - shown to all but actions only for admins */}
      <div className="grid gap-6">
        <PendingRequestsSection 
          pendingRequests={pendingRequests} 
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          isAdmin={isAdmin && isConnected}
        />
      </div>
    </div>
  );
};
