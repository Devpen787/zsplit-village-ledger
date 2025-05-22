
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/utils/expenseUtils";

interface ContributorProps {
  id: string;
  name?: string | null;
}

interface PotContributionsCardProps {
  totalContributions: number;
  targetAmount: number;
  contributors: ContributorProps[];
  onContribute: (amount: number, note: string) => Promise<void>;
}

export const PotContributionsCard = ({ 
  totalContributions, 
  targetAmount, 
  contributors,
  onContribute
}: PotContributionsCardProps) => {
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const percentComplete = Math.min(100, (totalContributions / targetAmount) * 100);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      await onContribute(parseFloat(amount), note);
      setContributeDialogOpen(false);
      setAmount("");
      setNote("");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Group Pot</span>
            <Button 
              size="sm" 
              onClick={() => setContributeDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Contribute
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <div className="text-sm font-medium">Progress towards target</div>
                <div className="text-sm font-medium">
                  {totalContributions.toFixed(2)} / {targetAmount.toFixed(2)} CHF
                </div>
              </div>
              <Progress value={percentComplete} className="h-2" />
            </div>
            
            {contributors.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Contributors</div>
                <div className="flex -space-x-2 overflow-hidden">
                  {contributors.map((contributor) => (
                    <Avatar 
                      key={contributor.id}
                      className="border-2 border-background inline-block h-8 w-8"
                    >
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(contributor.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground mt-4">
              {percentComplete >= 100 ? 
                "Target reached! The group can now use these funds." : 
                `${(targetAmount - totalContributions).toFixed(2)} CHF more needed to reach the target.`
              }
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Group Pot</DialogTitle>
            <DialogDescription>
              Add funds to the shared group pot. Your contribution will help reach the group's goal.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (CHF)</Label>
              <Input
                id="amount"
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
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="What's this contribution for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setContributeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !amount || parseFloat(amount) <= 0}>
                {isSubmitting ? "Contributing..." : "Contribute"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
