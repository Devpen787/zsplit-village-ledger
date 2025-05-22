
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletInfo from '@/components/wallet/WalletInfo';

export const IntroCard = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Group Financial Pulse</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            View group financial activity and statistics. Connect a wallet for additional features like submitting or approving payouts.
          </p>
          
          <div className="p-4 border rounded-md bg-muted/30">
            <WalletInfo 
              showLabel={true} 
              showMessage={true} 
              labelPrefix="Wallet: " 
              showConnectingState={false}
              connectMessage="Connect your wallet to submit payout requests or receive reimbursements."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
