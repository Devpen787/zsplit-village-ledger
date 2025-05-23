import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWallet } from '@/contexts/WalletContext';
import WalletInfo from '@/components/wallet/WalletInfo';
import { PotContributionsCard } from './PotContributionsCard';
import { RequestPayoutForm } from './RequestPayoutForm';
import { PendingPayoutRequests } from './PendingPayoutRequests';
import { PotActivityFeed } from './PotActivityFeed';
import { useGroupPot } from '@/hooks/useGroupPot';
import { Button } from '@/components/ui/button';
import { PiggyBank, Crown, CircleDollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { useAuth } from '@/contexts';

export const GroupPot = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const { user } = useAuth();
  const { group, loading: loadingGroup } = useGroupDetails(groupId, user);
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
        <Card className="shadow-sm hover:shadow transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <PiggyBank className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Group Pot{group?.name ? ` - ${group.name}` : ''}</CardTitle>
                    <CardDescription>Manage and view funds for group expenses</CardDescription>
                  </div>
                  
                  {isAdmin && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                      <Crown className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="border rounded-md p-3 flex-1 min-w-[200px] bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">Total Contributions</p>
                  <p className="text-2xl font-bold">CHF {totalContributions.toFixed(2)}</p>
                </div>
                
                <div className="border rounded-md p-3 flex-1 min-w-[200px] bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
                  <p className="text-2xl font-bold">CHF {remainingBalance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">After approved payouts</p>
                </div>
                
                <div className="border rounded-md p-3 flex-1 min-w-[200px] bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
                  <p className="text-2xl font-bold">CHF {targetAmount.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-4 border rounded-md bg-muted/30">
                <WalletInfo 
                  showLabel={true} 
                  showMessage={true} 
                  labelPrefix="Wallet: "
                  showConnectingState={false}
                  connectMessage="Optionally connect your wallet to automatically receive funds to your wallet address."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Show financial data to all users regardless of wallet connection */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <PotContributionsCard 
            totalContributions={totalContributions}
            targetAmount={targetAmount}
            onTargetChange={setTargetAmount}
            onContribute={handleContribute}
            contributors={contributors}
            isWalletConnected={isConnected}
            isAdmin={isAdmin}
          />
        </motion.div>
        
        {/* Show request payout form for all users, regardless of wallet connection */}
        <motion.div variants={item}>
          <RequestPayoutForm 
            onSubmit={handlePayoutRequest}
            isWalletConnected={isConnected}
          />
        </motion.div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <PendingPayoutRequests 
            activities={activities}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            isAdmin={isAdmin}
          />
        </motion.div>
        <motion.div variants={item}>
          <PotActivityFeed 
            activities={activities}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
