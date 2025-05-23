
import React from 'react';
import { GroupConnectivityCard } from './GroupConnectivityCard';
import { PayoutRequestsCard } from './PayoutRequestsCard';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';

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
  const { itemVariants } = useAnimations();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div variants={itemVariants}>
        <GroupConnectivityCard 
          connectedWalletsCount={connectedWalletsCount} 
          totalMembersCount={totalMembersCount} 
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <PayoutRequestsCard 
          pendingPayoutsCount={pendingPayoutsCount} 
          averageApprovalTime={averageApprovalTime} 
        />
      </motion.div>
    </div>
  );
};
