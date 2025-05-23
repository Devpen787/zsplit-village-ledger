
import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { motion } from 'framer-motion';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { useAuth } from '@/contexts';
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

  // Animation variants for staggered card appearance
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="grid gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Group Info Header */}
      <motion.div variants={item}>
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
          <motion.div variants={item} className="grid gap-6">
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
