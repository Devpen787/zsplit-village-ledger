
import React from 'react';
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from '@/contexts/WalletContext';
import { useAccount, useSendTransaction, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from "@/components/ui/sonner";
import { formatCurrency } from '@/utils/money';

interface WalletPaymentSectionProps {
  recipientWalletAddress: string | null;
  loadingRecipient: boolean;
  selectedChain: string;
  settlementAmount: number;
  onTransactionSuccess: (hash: `0x${string}`) => void;
}

export const WalletPaymentSection = ({
  recipientWalletAddress,
  loadingRecipient,
  selectedChain,
  settlementAmount,
  onTransactionSuccess
}: WalletPaymentSectionProps) => {
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

  // Handle successful transaction
  React.useEffect(() => {
    if (isConfirmed && transactionHash) {
      onTransactionSuccess(transactionHash);
    }
  }, [isConfirmed, transactionHash, onTransactionSuccess]);

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
      const amountInWei = parseEther(settlementAmount.toString());
      
      sendTransaction({
        to: recipientWalletAddress as `0x${string}`,
        value: amountInWei,
      });
      
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast.error('Failed to send transaction');
    }
  };

  const canPayWithWallet = recipientWalletAddress && isConnected && selectedChain !== 'polkadot';
  const isProcessingWalletPayment = isSending || isConfirming;

  return (
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
              `Pay ${formatCurrency(settlementAmount)}`
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
  );
};
