
import React from 'react';
import { PotBalanceCard } from './PotBalanceCard';
import { ExpensesStatusCard } from './ExpensesStatusCard';
import { PotHealthCard } from './PotHealthCard';
import { RecentActivityCard } from './RecentActivityCard';
import { motion } from 'framer-motion';

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
  // Animation variants for staggered card appearance
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <PotBalanceCard potBalance={potBalance} />
        </motion.div>
        <motion.div variants={item}>
          <ExpensesStatusCard potBalance={potBalance} loading={loading} />
        </motion.div>
      </div>
      
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
    </>
  );
};
