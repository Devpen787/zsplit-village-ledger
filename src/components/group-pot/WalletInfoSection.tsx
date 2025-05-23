
import React from 'react';
import { CardContent } from "@/components/ui/card";
import WalletInfo from '@/components/wallet/WalletInfo';

export const WalletInfoSection = () => {
  return (
    <div className="p-4 border rounded-md bg-muted/30">
      <WalletInfo 
        showLabel={true} 
        showMessage={true} 
        labelPrefix="Wallet: "
        showConnectingState={false}
        connectMessage="Optionally connect your wallet to automatically receive funds to your wallet address."
      />
    </div>
  );
};
