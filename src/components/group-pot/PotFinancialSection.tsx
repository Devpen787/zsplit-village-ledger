
import React from 'react';
import { PotContributionsCard } from './PotContributionsCard';
import { RequestPayoutForm } from './RequestPayoutForm';
import { motion } from 'framer-motion';

interface PotFinancialSectionProps {
  totalContributions: number;
  targetAmount: number;
  onTargetChange: (amount: number) => void;
  onContribute: (amount: number, note: string) => Promise<void>;
  contributors: {id: string; name?: string | null}[];
  isWalletConnected: boolean;
  isAdmin: boolean;
  onSubmitPayout: (amount: number, note: string) => Promise<void>;
}

export const PotFinancialSection = ({
  totalContributions,
  targetAmount,
  onTargetChange,
  onContribute,
  contributors,
  isWalletConnected,
  isAdmin,
  onSubmitPayout
}: PotFinancialSectionProps) => {
  // Animation variants for staggered card appearance
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div variants={item}>
        <PotContributionsCard 
          totalContributions={totalContributions}
          targetAmount={targetAmount}
          onTargetChange={onTargetChange}
          onContribute={onContribute}
          contributors={contributors}
          isWalletConnected={isWalletConnected}
          isAdmin={isAdmin}
        />
      </motion.div>
      
      <motion.div variants={item}>
        <RequestPayoutForm 
          onSubmit={onSubmitPayout}
          isWalletConnected={isWalletConnected}
        />
      </motion.div>
    </div>
  );
};
