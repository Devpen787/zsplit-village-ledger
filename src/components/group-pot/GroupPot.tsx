
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from '@/contexts/WalletContext';
import WalletInfo from '@/components/wallet/WalletInfo';
import { PotContributionsCard } from './PotContributionsCard';
import { RequestPayoutForm } from './RequestPayoutForm';
import { PendingPayoutRequests } from './PendingPayoutRequests';
import { PotActivityFeed } from './PotActivityFeed';

export const GroupPot = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();

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
            <PotContributionsCard groupId={groupId} />
            <RequestPayoutForm groupId={groupId} />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <PendingPayoutRequests groupId={groupId} />
            <PotActivityFeed groupId={groupId} />
          </div>
        </>
      )}
    </div>
  );
};
