
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from '@/contexts/WalletContext';
import WalletInfo from '@/components/wallet/WalletInfo';
import { PotContributionsCard } from './PotContributionsCard';
import { RequestPayoutForm } from './RequestPayoutForm';
import { PendingPayoutRequests } from './PendingPayoutRequests';
import { PotActivityFeed } from './PotActivityFeed';
import { useGroupPot } from '@/hooks/useGroupPot';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Group Pot</CardTitle>
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

      {/* Show financial data to all users regardless of wallet connection */}
      <div className="grid gap-6 md:grid-cols-2">
        <PotContributionsCard 
          totalContributions={totalContributions}
          targetAmount={targetAmount}
          onContribute={handleContribute}
          contributors={contributors}
          isWalletConnected={isConnected}
        />
        
        {/* Show request payout form only if wallet is connected */}
        {isConnected ? (
          <RequestPayoutForm 
            onSubmit={handlePayoutRequest}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Connect your wallet to request payouts from the group pot.
              </p>
              <Button className="w-full" variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet to Request Payouts
              </Button>
            </CardContent>
          </Card>
        )}
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
    </div>
  );
};
