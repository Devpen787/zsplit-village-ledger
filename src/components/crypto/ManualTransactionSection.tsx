
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

interface ManualTransactionSectionProps {
  txHash: string;
  onTxHashChange: (value: string) => void;
  selectedChain: string;
}

export const ManualTransactionSection = ({
  txHash,
  onTxHashChange,
  selectedChain
}: ManualTransactionSectionProps) => {
  const getExplorerUrl = (hash: string, chain: string) => {
    switch (chain) {
      case 'ethereum':
        return `https://etherscan.io/tx/${hash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${hash}`;
      case 'polkadot':
        return `https://subscan.io/extrinsic/${hash}`;
      default:
        return `https://etherscan.io/tx/${hash}`;
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-medium">Or Record Manual Transaction</h3>
      
      <div className="space-y-2">
        <Label htmlFor="txHash">Transaction Hash</Label>
        <Input
          id="txHash"
          placeholder="0x..."
          value={txHash}
          onChange={(e) => onTxHashChange(e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Paste the transaction hash from your blockchain transaction
        </p>
      </div>

      {txHash && (
        <div className="flex items-center gap-2 text-sm">
          <span>Preview:</span>
          <a
            href={getExplorerUrl(txHash, selectedChain)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            {txHash.slice(0, 6)}...{txHash.slice(-4)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
};
