
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RequestPayoutFormProps {
  onSubmit: (amount: number, note: string) => Promise<void>;
}

export const RequestPayoutForm = ({ onSubmit }: RequestPayoutFormProps) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || !note}>
          {isSubmitting ? "Submitting..." : "Request Payout"}
        </Button>
      </div>
    </form>
  );
};
