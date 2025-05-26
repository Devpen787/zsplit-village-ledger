
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settlement } from '@/hooks/useSettlements';
import { PaymentSummaryCard } from './PaymentSummaryCard';
import { WalletPaymentSection } from './WalletPaymentSection';
import { ManualTransactionSection } from './ManualTransactionSection';

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
  const [recipientWalletAddress, setRecipientWalletAddress] = useState<string | null>(null);
  const [loadingRecipient, setLoadingRecipient] = useState(false);

  // Fetch recipient's wallet address when modal opens
  React.useEffect(() => {
    if (isOpen && settlement.toUserId) {
      fetchRecipientWallet();
    }
  }, [isOpen, settlement.toUserId]);

  const fetchRecipientWallet = async () => {
    setLoadingRecipient(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', settlement.toUserId)
        .single();

      if (error) {
        console.error('Error fetching recipient wallet:', error);
        return;
      }

      setRecipientWalletAddress(data?.wallet_address || null);
    } catch (error) {
      console.error('Error in fetchRecipientWallet:', error);
    } finally {
      setLoadingRecipient(false);
    }
  };

  const handleTransactionSuccess = async (hash: `0x${string}`) => {
    try {
      // Get current chain ID to determine the chain
      const chainId = await window.ethereum?.request({ method: 'eth_chainId' });
      const chainName = chainId === '0x1' ? 'ethereum' : chainId === '0x89' ? 'polygon' : 'ethereum';

      const { error } = await supabase
        .from('settlements')
        .upsert({
          from_user_id: settlement.fromUserId,
          to_user_id: settlement.toUserId,
          amount: settlement.amount,
          settled: true,
          tx_hash: hash,
          tx_chain: chainName,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'from_user_id,to_user_id'
        });

      if (error) {
        console.error('Error saving settlement:', error);
        toast.error('Payment sent but failed to record settlement');
        return;
      }

      toast.success('Payment sent successfully!');
      onSettled();
      onClose();
      setTxHash('');
      setSelectedChain('ethereum');
    } catch (error) {
      console.error('Error in handleTransactionSuccess:', error);
      toast.error('Payment sent but failed to record settlement');
    }
  };

  const handleManualSubmit = async () => {
    if (!txHash.trim()) {
      toast.error('Please enter a transaction hash');
      return;
    }

    setIsSubmitting(true);
    
    try {
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
      console.error('Error in handleManualSubmit:', error);
      toast.error('Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle On-Chain</DialogTitle>
          <DialogDescription>
            Pay directly with your wallet or record an existing transaction
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <PaymentSummaryCard settlement={settlement} />

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

          <WalletPaymentSection
            recipientWalletAddress={recipientWalletAddress}
            loadingRecipient={loadingRecipient}
            selectedChain={selectedChain}
            settlementAmount={settlement.amount}
            onTransactionSuccess={handleTransactionSuccess}
          />

          <ManualTransactionSection
            txHash={txHash}
            onTxHashChange={setTxHash}
            selectedChain={selectedChain}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleManualSubmit} 
            disabled={isSubmitting || !txHash.trim()}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Settlement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
