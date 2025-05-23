
import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { useAuth } from '@/contexts';
import { useAnimations } from '@/hooks/useAnimations';
import { GroupPulseHeader } from './GroupPulseHeader';
import { GroupFinancialMetrics } from './GroupFinancialMetrics';
import { GroupConnectivityMetrics } from './GroupConnectivityMetrics';
import { PendingRequestsSection } from './PendingRequestsSection';
import { CrossGroupOverview } from './CrossGroupOverview';

interface GroupPulseProps {
  groupId: string;
  activeTab?: "group" | "all";
  onTabChange?: (value: "group" | "all") => void;
}

export const GroupPulse = ({ 
  groupId, 
  activeTab = "group", 
  onTabChange 
}: GroupPulseProps) => {
  const { isConnected } = useWallet();
  const { user } = useAuth();
  const { group } = useGroupDetails(groupId, user);
  const { containerVariants, itemVariants } = useAnimations();
  
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
    isAdmin,
    allGroupsStats
  } = useGroupPulse(groupId);

  const handleTabChange = (value: "group" | "all") => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <div 
      className="grid gap-6"
      style={{
        opacity: 1,
        transform: 'none'
      }}
    >
      {/* Group Info Header */}
      <div>
        <GroupPulseHeader 
          groupName={activeTab === "all" ? undefined : group?.name} 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      </div>

      {activeTab === "group" ? (
        <>
          {/* Financial metrics */}
          <GroupFinancialMetrics 
            potBalance={potBalance}
            loading={loading}
            averagePayoutSize={averagePayoutSize}
            estimatedPayoutsRemaining={estimatedPayoutsRemaining}
            recentExpensesCount={recentExpensesCount}
            latestExpenseDate={latestExpenseDate}
          />
          
          {/* Group connectivity status */}
          <GroupConnectivityMetrics 
            connectedWalletsCount={connectedWalletsCount}
            totalMembersCount={totalMembersCount}
            pendingPayoutsCount={pendingPayoutsCount}
            averageApprovalTime={averageApprovalTime}
          />

          {/* Pending payout requests list - shown to all but actions only for admins */}
          <div className="grid gap-6">
            <PendingRequestsSection 
              pendingRequests={pendingRequests} 
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              isAdmin={isAdmin && isConnected}
            />
          </div>
        </>
      ) : (
        // Cross-group statistics view
        <CrossGroupOverview allGroupsStats={allGroupsStats} />
      )}
    </div>
  );
};
