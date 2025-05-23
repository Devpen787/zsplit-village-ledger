
import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useGroupPot } from '@/hooks/useGroupPot';
import { useAuth } from '@/contexts';
import { motion } from 'framer-motion';
import { GroupPotSummaryHeader } from './GroupPotSummaryHeader';
import { WalletInfoSection } from './WalletInfoSection';
import { PotFinancialSection } from './PotFinancialSection';
import { PotActivitySection } from './PotActivitySection';

export const GroupPot = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const { user } = useAuth();
  const {
    totalContributions,
    targetAmount,
    remainingBalance,
    setTargetAmount,
    activities,
    contributors,
    handleContribute,
    handlePayoutRequest,
    handleApproveRequest,
    handleRejectRequest,
    isAdmin,
    loading
  } = useGroupPot(groupId);

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
      <motion.div variants={item}>
        <GroupPotSummaryHeader 
          groupId={groupId}
          totalContributions={totalContributions}
          remainingBalance={remainingBalance}
          targetAmount={targetAmount}
          isAdmin={isAdmin}
        />
      </motion.div>

      <motion.div variants={item}>
        <WalletInfoSection />
      </motion.div>

      <PotFinancialSection 
        totalContributions={totalContributions}
        targetAmount={targetAmount}
        onTargetChange={setTargetAmount}
        onContribute={handleContribute}
        contributors={contributors}
        isWalletConnected={isConnected}
        isAdmin={isAdmin}
        onSubmitPayout={handlePayoutRequest}
      />
      
      <PotActivitySection 
        activities={activities}
        onApproveRequest={handleApproveRequest}
        onRejectRequest={handleRejectRequest}
        isAdmin={isAdmin}
      />
    </motion.div>
  );
};
