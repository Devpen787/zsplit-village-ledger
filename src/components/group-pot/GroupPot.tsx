
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
import { AlertTriangle, Wallet, PiggyBank, ArrowDownUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const GroupPot = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const {
    totalContributions,
    targetAmount,
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
              <div>
                <CardTitle>Group Pot</CardTitle>
                <CardDescription>Manage and view funds for group expenses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                View and interact with the group pot. Connect a wallet to contribute funds or request payouts.
              </p>
              
              <div className="p-4 border rounded-md bg-muted/30">
                <WalletInfo 
                  showLabel={true} 
                  showMessage={true} 
                  labelPrefix="Wallet: "
                  showConnectingState={false}
                  connectMessage="Connect your wallet to contribute to or request funds from the group pot."
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
            onContribute={handleContribute}
            contributors={contributors}
            isWalletConnected={isConnected}
          />
        </motion.div>
        
        {/* Show request payout form only if wallet is connected */}
        <motion.div variants={item}>
          {isConnected ? (
            <RequestPayoutForm 
              onSubmit={handlePayoutRequest}
            />
          ) : (
            <Card className="shadow-sm h-full hover:shadow transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ArrowDownUp className="h-5 w-5 text-primary" />
                  <CardTitle>Request Payout</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col justify-center h-[calc(100%-80px)]">
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-70" />
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to request payouts from the group pot.
                  </p>
                  <Button className="w-full sm:w-auto" variant="outline">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet to Request Payouts
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
