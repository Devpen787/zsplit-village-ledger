
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
import { ExternalLink, Loader2, Wallet, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Settlement } from '@/hooks/useSettlements';
import { formatCurrency } from '@/utils/money';
import { useWallet } from '@/contexts/WalletContext';
import { useAccount, useSendTransaction, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  const { isConnected, connect } = useWallet();
  const { address } = useAccount();
  
  const { 
    sendTransaction, 
    data: transactionHash,
    isLoading: isSending,
    error: sendError 
  } = useSendTransaction();
  
  const { 
    isLoading: isConfirming,
    isSuccess: isConfirmed 
  } = useWaitForTransaction({
    hash: transactionHash,
  });

  // Fetch recipient's wallet address when modal opens
  React.useEffect(() => {
    if (isOpen && settlement.toUserId) {
      fetchRecipientWallet();
    }
  }, [isOpen, settlement.toUserId]);

  // Handle successful transaction
  React.useEffect(() => {
    if (isConfirmed && transactionHash) {
      handleTransactionSuccess(transactionHash);
    }
  }, [isConfirmed, transactionHash]);

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

  const getChainId = (chain: string): number => {
    switch (chain) {
      case 'ethereum':
        return 1;
      case 'polygon':
        return 137;
      default:
        return 1;
    }
  };

  const handleWalletPayment = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    if (!recipientWalletAddress) {
      toast.error('Recipient has no wallet address connected');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const amountInWei = parseEther(settlement.amount.toString());
      
      sendTransaction({
        to: recipientWalletAddress as `0x${string}`,
        value: amountInWei,
      });
      
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast.error('Failed to send transaction');
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

  const canPayWithWallet = recipientWalletAddress && isConnected && selectedChain !== 'polkadot';
  const isProcessingWalletPayment = isSending || isConfirming;

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

          {/* Wallet Payment Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <h3 className="font-medium">Pay with Wallet</h3>
            </div>
            
            {loadingRecipient ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading recipient wallet...
              </div>
            ) : !recipientWalletAddress ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The recipient hasn't connected a wallet address yet. You can still record a manual transaction below.
                </AlertDescription>
              </Alert>
            ) : selectedChain === 'polkadot' ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Direct wallet payments are not supported for Polkadot. Please use the manual transaction hash method.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Recipient: {recipientWalletAddress.slice(0, 6)}...{recipientWalletAddress.slice(-4)}
                </div>
                <Button
                  onClick={handleWalletPayment}
                  disabled={!canPayWithWallet || isProcessingWalletPayment}
                  className="w-full"
                >
                  {!isConnected ? (
                    'Connect Wallet'
                  ) : isProcessingWalletPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSending ? 'Sending...' : 'Confirming...'}
                    </>
                  ) : (
                    `Pay ${formatCurrency(settlement.amount)}`
                  )}
                </Button>
              </div>
            )}

            {sendError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Transaction failed: {sendError.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Manual Transaction Hash Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-medium">Or Record Manual Transaction</h3>
            
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isProcessingWalletPayment}>
            Cancel
          </Button>
          <Button 
            onClick={handleManualSubmit} 
            disabled={isSubmitting || !txHash.trim() || isProcessingWalletPayment}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Settlement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
