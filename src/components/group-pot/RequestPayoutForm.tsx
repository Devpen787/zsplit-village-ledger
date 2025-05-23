
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useWallet } from '@/contexts/WalletContext';
import { Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequestPayoutFormProps {
  onSubmit: (amount: number, note: string) => Promise<void>;
  isWalletConnected: boolean;
}

export const RequestPayoutForm = ({ onSubmit, isWalletConnected }: RequestPayoutFormProps) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address, shortenAddress } = useWallet();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(parseFloat(amount), note);
      setAmount("");
      setNote("");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="shadow-sm h-full hover:shadow transition-shadow duration-300">
      <CardHeader>
        <CardTitle>Request Payout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payout-amount">Amount (CHF)</Label>
              <Input
                id="payout-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payout-note">
              Request Reason <span className="text-muted-foreground">(required)</span>
            </Label>
            <Textarea
              id="payout-note"
              placeholder="Explain what this payout is for..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>
          
          {isWalletConnected && address && (
            <div className="bg-muted/30 p-3 rounded-lg flex items-center text-sm">
              <Wallet className="h-4 w-4 mr-2 text-primary" />
              <span className="text-muted-foreground">Connected Wallet: </span>
              <span className="font-medium ml-1">{shortenAddress(address)}</span>
              <span className="ml-1 text-xs text-muted-foreground">(funds will be sent here)</span>
            </div>
          )}
          
          {!isWalletConnected && (
            <div className="bg-muted/30 p-3 rounded-lg text-sm">
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">No wallet connected - you will need to arrange fund transfer manually</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || !note}>
              {isSubmitting ? "Submitting..." : "Request Payout"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
