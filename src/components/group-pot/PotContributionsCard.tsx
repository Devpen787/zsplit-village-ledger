
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Edit2, Check } from "lucide-react";

interface PotContributionsCardProps {
  totalContributions: number;
  targetAmount: number;
  onContribute: (amount: number, note: string) => Promise<void>;
  onTargetChange?: (amount: number) => void;
  contributors: { id: string; name?: string | null }[];
  isWalletConnected?: boolean;
  isAdmin?: boolean;
}

export const PotContributionsCard = ({ 
  totalContributions, 
  targetAmount, 
  onContribute,
  onTargetChange,
  contributors,
  isWalletConnected = false,
  isAdmin = false
}: PotContributionsCardProps) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetAmount, setNewTargetAmount] = useState(targetAmount.toString());
  
  const progressPercentage = (totalContributions / targetAmount) * 100;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      await onContribute(parseFloat(amount), note);
      setAmount("");
      setNote("");
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTargetChange && newTargetAmount && parseFloat(newTargetAmount) > 0) {
      onTargetChange(parseFloat(newTargetAmount));
      setIsEditingTarget(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Pot Contributions</CardTitle>
          {isAdmin && onTargetChange && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="h-8 px-2"
            >
              {isEditingTarget ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <CardDescription>
          Track contributions to the group pot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingTarget && isAdmin && onTargetChange ? (
          <form onSubmit={handleTargetSubmit} className="space-y-2">
            <Label htmlFor="target-amount">Target Amount (CHF)</Label>
            <div className="flex space-x-2">
              <Input
                id="target-amount"
                type="number"
                step="1"
                min="1"
                value={newTargetAmount}
                onChange={(e) => setNewTargetAmount(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" size="sm">Save</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{contributors.length} contributor{contributors.length !== 1 ? 's' : ''}</span>
              <span>
                CHF {totalContributions.toFixed(2)} / CHF {targetAmount.toFixed(2)}
              </span>
            </div>
            <Progress value={progressPercentage > 100 ? 100 : progressPercentage} />
          </div>
        )}
        
        {!showForm && (
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowForm(true)}>
              Contribute to Pot
            </Button>
          </div>
        )}
        
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="contribution-amount">Amount (CHF)</Label>
              <Input
                id="contribution-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contribution-note">Note (optional)</Label>
              <Textarea
                id="contribution-note"
                placeholder="Add a note about your contribution..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2 justify-end">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              >
                {isSubmitting ? "Contributing..." : "Contribute"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
