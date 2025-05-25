
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Bell } from "lucide-react";
import { BalanceData } from './BalancesTable';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/utils/money';
import { toast } from '@/components/ui/sonner';

interface DebtRelationship {
  creditorId: string;
  creditorName: string;
  debtorId: string;
  debtorName: string;
  amount: number;
  isUserInvolved: boolean;
  isUserCreditor: boolean;
  isUserDebtor: boolean;
}

interface DebtRelationshipsProps {
  balances: BalanceData[];
  onSendReminder: (relationship: DebtRelationship) => void;
}

export const DebtRelationships = ({ balances, onSendReminder }: DebtRelationshipsProps) => {
  const { user } = useAuth();

  // Calculate debt relationships
  const debtRelationships: DebtRelationship[] = React.useMemo(() => {
    const creditors = balances.filter(b => b.netBalance > 0.01);
    const debtors = balances.filter(b => b.netBalance < -0.01);
    
    const relationships: DebtRelationship[] = [];
    
    // For each debtor, calculate who they owe money to
    debtors.forEach(debtor => {
      const totalOwed = Math.abs(debtor.netBalance);
      let remainingDebt = totalOwed;
      
      creditors.forEach(creditor => {
        if (remainingDebt <= 0.01) return;
        
        const amountToSettle = Math.min(remainingDebt, creditor.netBalance);
        
        if (amountToSettle > 0.01) {
          const isUserCreditor = creditor.userId === user?.id;
          const isUserDebtor = debtor.userId === user?.id;
          
          relationships.push({
            creditorId: creditor.userId,
            creditorName: creditor.userName || 'Unknown',
            debtorId: debtor.userId,
            debtorName: debtor.userName || 'Unknown',
            amount: amountToSettle,
            isUserInvolved: isUserCreditor || isUserDebtor,
            isUserCreditor,
            isUserDebtor
          });
          
          remainingDebt -= amountToSettle;
          creditor.netBalance -= amountToSettle;
        }
      });
    });
    
    return relationships.sort((a, b) => {
      // User's relationships first
      if (a.isUserInvolved && !b.isUserInvolved) return -1;
      if (!a.isUserInvolved && b.isUserInvolved) return 1;
      // Then by amount descending
      return b.amount - a.amount;
    });
  }, [balances, user?.id]);

  const userRelationships = debtRelationships.filter(r => r.isUserInvolved);
  const otherRelationships = debtRelationships.filter(r => !r.isUserInvolved);

  const handleSendReminder = (relationship: DebtRelationship) => {
    onSendReminder(relationship);
    toast.success(`Reminder sent to ${relationship.debtorName}`);
  };

  if (debtRelationships.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Everyone is settled up! No outstanding debts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Who Owes Who?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userRelationships.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 text-sm text-muted-foreground">Your debts</h3>
            <div className="space-y-2">
              {userRelationships.map((relationship, index) => (
                <div 
                  key={`user-${index}`}
                  className="flex items-center justify-between p-3 bg-primary/5 rounded-md border"
                >
                  <div className="flex items-center gap-2">
                    {relationship.isUserDebtor ? (
                      <>
                        <span className="font-medium">You</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{relationship.creditorName}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{relationship.debtorName}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">You</span>
                      </>
                    )}
                    <Badge variant={relationship.isUserDebtor ? "destructive" : "success"}>
                      {formatCurrency(relationship.amount)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {relationship.isUserCreditor && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(relationship)}
                        className="flex items-center gap-1"
                      >
                        <Bell className="h-3 w-3" />
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {otherRelationships.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 text-sm text-muted-foreground">Other debts in group</h3>
            <div className="space-y-2">
              {otherRelationships.slice(0, 5).map((relationship, index) => (
                <div 
                  key={`other-${index}`}
                  className="flex items-center justify-between p-3 bg-secondary/10 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{relationship.debtorName}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{relationship.creditorName}</span>
                    <Badge variant="outline">
                      {formatCurrency(relationship.amount)}
                    </Badge>
                  </div>
                </div>
              ))}
              {otherRelationships.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{otherRelationships.length - 5} more relationships
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
