
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, ExternalLink } from "lucide-react";
import { Settlement } from '@/hooks/useSettlements';
import { SettleOnChainModal } from './SettleOnChainModal';
import { useAuth } from '@/contexts';

interface OnChainSettlementButtonProps {
  settlement: Settlement;
  onSettled: () => void;
  txHash?: string | null;
  txChain?: string | null;
}

export const OnChainSettlementButton = ({ 
  settlement, 
  onSettled,
  txHash,
  txChain 
}: OnChainSettlementButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const isUserDebtor = settlement.fromUserId === user?.id;
  
  // Don't show the button if user is not the debtor
  if (!isUserDebtor) {
    return null;
  }

  const getExplorerUrl = (hash: string, chain?: string | null) => {
    switch (chain) {
      case 'ethereum':
        return `https://etherscan.io/tx/${hash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${hash}`;
      case 'polkadot':
        return `https://subscan.io/extrinsic/${hash}`;
      default:
        // Default to Etherscan if chain is null or unknown
        return `https://etherscan.io/tx/${hash}`;
    }
  };

  const getChainDisplayName = (chain?: string | null) => {
    switch (chain) {
      case 'ethereum':
        return 'Ethereum';
      case 'polygon':
        return 'Polygon';
      case 'polkadot':
        return 'Polkadot';
      default:
        return 'Ethereum'; // Default display name
    }
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  // If there's already a tx_hash, show the link instead of the button
  if (txHash) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {getChainDisplayName(txChain)}:
        </span>
        <a
          href={getExplorerUrl(txHash, txChain)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline text-xs"
        >
          {shortenHash(txHash)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1 text-xs"
      >
        <Link className="h-3 w-3" />
        Settle On-Chain
      </Button>
      
      <SettleOnChainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settlement={settlement}
        onSettled={onSettled}
      />
    </>
  );
};
