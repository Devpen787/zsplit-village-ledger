
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from '@/contexts/WalletContext';
import WalletInfo from '@/components/wallet/WalletInfo';
import { PotContributionsCard } from './PotContributionsCard';
import { RequestPayoutForm } from './RequestPayoutForm';
import { PendingPayoutRequests } from './PendingPayoutRequests';
import { PotActivityFeed } from './PotActivityFeed';
import { useGroupPot } from '@/hooks/useGroupPot';

export const GroupPot = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const {
    totalContributions,
    targetAmount, // Add the targetAmount from the hook
    activities,
    contributors,
    handleContribute,
    handlePayoutRequest,
    handleApproveRequest,
    handleRejectRequest,
    isAdmin,
    loading
  } = useGroupPot(groupId);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Group Pot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect your wallet to contribute to and receive funds from the group pot.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <WalletInfo 
                showLabel={true} 
                showMessage={true} 
                labelPrefix="Wallet: "
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Only show pot features when wallet is connected */}
      {isConnected && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <PotContributionsCard 
              totalContributions={totalContributions}
              targetAmount={targetAmount} // Pass the targetAmount
              onContribute={handleContribute}
              contributors={contributors}
            />
            <RequestPayoutForm 
              onSubmit={handlePayoutRequest}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <PendingPayoutRequests 
              activities={activities}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              isAdmin={isAdmin}
            />
            <PotActivityFeed 
              activities={activities}
            />
          </div>
        </>
      )}
    </div>
  );
};
