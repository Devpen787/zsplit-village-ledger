
import React from 'react';
import { PotBalanceCard } from './PotBalanceCard';
import { ExpensesStatusCard } from './ExpensesStatusCard';
import { PotHealthCard } from './PotHealthCard';
import { RecentActivityCard } from './RecentActivityCard';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';

interface GroupFinancialMetricsProps {
  potBalance: number;
  loading: boolean;
  averagePayoutSize: number;
  estimatedPayoutsRemaining: number;
  recentExpensesCount: number;
  latestExpenseDate: Date | null;
}

export const GroupFinancialMetrics = ({
  potBalance,
  loading,
  averagePayoutSize,
  estimatedPayoutsRemaining,
  recentExpensesCount,
  latestExpenseDate
}: GroupFinancialMetricsProps) => {
  const { itemVariants } = useAnimations();

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <PotBalanceCard potBalance={potBalance} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ExpensesStatusCard potBalance={potBalance} loading={loading} />
        </motion.div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <PotHealthCard 
            averagePayoutSize={averagePayoutSize} 
            estimatedPayoutsRemaining={estimatedPayoutsRemaining} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RecentActivityCard 
            recentExpensesCount={recentExpensesCount} 
            latestExpenseDate={latestExpenseDate} 
          />
        </motion.div>
      </div>
    </>
  );
};
