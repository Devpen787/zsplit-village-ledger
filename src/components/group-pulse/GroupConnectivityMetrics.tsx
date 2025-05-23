
import React from 'react';
import { GroupConnectivityCard } from './GroupConnectivityCard';
import { PayoutRequestsCard } from './PayoutRequestsCard';
import { motion } from 'framer-motion';

interface GroupConnectivityMetricsProps {
  connectedWalletsCount: number;
  totalMembersCount: number;
  pendingPayoutsCount: number;
  averageApprovalTime: string;
}

export const GroupConnectivityMetrics = ({
  connectedWalletsCount,
  totalMembersCount,
  pendingPayoutsCount,
  averageApprovalTime
}: GroupConnectivityMetricsProps) => {
  // Animation variants for staggered card appearance
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
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
  );
};
