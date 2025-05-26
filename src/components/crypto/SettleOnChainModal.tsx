
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settlement } from '@/hooks/useSettlements';
import { formatCurrency } from '@/utils/money';

interface SettleOnChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: Settlement;
  onSettled: () => void;
}

const BLOCKCHAIN_OPTIONS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'polkadot', label: 'Polkadot' }
];

export const SettleOnChainModal = ({ 
  isOpen, 
  onClose, 
  settlement, 
  onSettled 
}: SettleOnChainModalProps) => {
  const [txHash, setTxHash] = useState('');
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!txHash.trim()) {
      toast.error('Please enter a transaction hash');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert or update settlement record with tx_hash and tx_chain
      const { error } = await supabase
        .from('settlements')
        .upsert({
          from_user_id: settlement.fromUserId,
          to_user_id: settlement.toUserId,
          amount: settlement.amount,
          settled: true,
          tx_hash: txHash.trim(),
          tx_chain: selectedChain,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'from_user_id,to_user_id'
        });

      if (error) {
        console.error('Error saving settlement:', error);
        toast.error('Failed to save settlement');
        return;
      }

      toast.success('On-chain settlement recorded successfully!');
      onSettled();
      onClose();
      setTxHash('');
      setSelectedChain('ethereum');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle On-Chain</DialogTitle>
          <DialogDescription>
            Record your blockchain transaction for this settlement
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-secondary/10 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span>Payment from:</span>
              <span className="font-medium">{settlement.fromUserName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Payment to:</span>
              <span className="font-medium">{settlement.toUserName}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold border-t pt-2 mt-2">
              <span>Amount:</span>
              <span className="text-lg">{formatCurrency(settlement.amount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockchain">Blockchain Network</Label>
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger>
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent>
                {BLOCKCHAIN_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="txHash">Transaction Hash</Label>
            <Input
              id="txHash"
              placeholder="0x..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
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

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !txHash.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Settlement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
