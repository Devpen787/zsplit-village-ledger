
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
import { motion } from 'framer-motion';

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
      {/* Introduction Card */}
      <motion.div variants={item}>
        <IntroCard />
      </motion.div>

      {/* Financial metrics shown to all users regardless of wallet connection */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <PotBalanceCard potBalance={potBalance} />
        </motion.div>
        <motion.div variants={item}>
          <ExpensesStatusCard potBalance={potBalance} loading={loading} />
        </motion.div>
      </div>
      
      {/* Pot Health and Activity metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <PotHealthCard 
            averagePayoutSize={averagePayoutSize} 
            estimatedPayoutsRemaining={estimatedPayoutsRemaining} 
          />
        </motion.div>
        <motion.div variants={item}>
          <RecentActivityCard 
            recentExpensesCount={recentExpensesCount} 
            latestExpenseDate={latestExpenseDate} 
          />
        </motion.div>
      </div>
      
      {/* Group connectivity status */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <GroupConnectivityCard 
            connectedWalletsCount={connectedWalletsCount} 
            totalMembersCount={totalMembersCount} 
          />
        </motion.div>
        <motion.div variants={item}>
          <PayoutRequestsCard 
            pendingPayoutsCount={pendingPayoutsCount} 
            averageApprovalTime={averageApprovalTime} 
          />
        </motion.div>
      </div>

      {/* Pending payout requests list - shown to all but actions only for admins */}
      <motion.div variants={item} className="grid gap-6">
        <PendingRequestsSection 
          pendingRequests={pendingRequests} 
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          isAdmin={isAdmin && isConnected}
        />
      </motion.div>
    </motion.div>
  );
};
