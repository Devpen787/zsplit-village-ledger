
import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { motion } from 'framer-motion';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { useAuth } from '@/contexts';
import { useAnimations } from '@/hooks/useAnimations';
import { GroupPulseHeader } from './GroupPulseHeader';
import { GroupFinancialMetrics } from './GroupFinancialMetrics';
import { GroupConnectivityMetrics } from './GroupConnectivityMetrics';
import { PendingRequestsSection } from './PendingRequestsSection';
import { CrossGroupOverview } from './CrossGroupOverview';

export const GroupPulse = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const { user } = useAuth();
  const { group } = useGroupDetails(groupId, user);
  const [activeTab, setActiveTab] = useState<"group" | "all">("group");
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

  return (
    <motion.div 
      className="grid gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Group Info Header */}
      <motion.div variants={itemVariants}>
        <GroupPulseHeader 
          groupName={group?.name} 
          activeTab={activeTab} 
          onTabChange={(value) => setActiveTab(value)} 
        />
      </motion.div>

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
          <motion.div variants={itemVariants} className="grid gap-6">
            <PendingRequestsSection 
              pendingRequests={pendingRequests} 
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              isAdmin={isAdmin && isConnected}
            />
          </motion.div>
        </>
      ) : (
        // Cross-group statistics view
        <CrossGroupOverview allGroupsStats={allGroupsStats} />
      )}
    </motion.div>
  );
};
