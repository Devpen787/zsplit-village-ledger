import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Bell, Users } from "lucide-react";
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
  const peopleWhoOweMe = debtRelationships.filter(r => r.isUserCreditor);
  const peopleIOweTo = debtRelationships.filter(r => r.isUserDebtor);
  const otherRelationships = debtRelationships.filter(r => !r.isUserInvolved);

  const handleSendReminder = (relationship: DebtRelationship) => {
    onSendReminder(relationship);
    toast.success(`Reminder sent to ${relationship.debtorName}`);
  };

  if (debtRelationships.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Debt Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            🎉 Everyone is settled up! No outstanding debts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Who Owes Who?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* People who owe ME money */}
        {peopleWhoOweMe.length > 0 && (
          <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold mb-3 text-green-700 dark:text-green-400 flex items-center gap-2">
              💰 People who owe you money ({peopleWhoOweMe.length})
            </h3>
            <div className="space-y-3">
              {peopleWhoOweMe.map((relationship, index) => (
                <div 
                  key={`owed-to-me-${index}`}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {relationship.debtorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{relationship.debtorName}</p>
                      <p className="text-sm text-muted-foreground">owes you</p>
                    </div>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      {formatCurrency(relationship.amount)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendReminder(relationship)}
                    className="flex items-center gap-1 border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <Bell className="h-3 w-3" />
                    Send Reminder
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People I OWE money to */}
        {peopleIOweTo.length > 0 && (
          <div className="bg-red-50/50 dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <h3 className="font-semibold mb-3 text-red-700 dark:text-red-400 flex items-center gap-2">
              💳 People you owe money to ({peopleIOweTo.length})
            </h3>
            <div className="space-y-3">
              {peopleIOweTo.map((relationship, index) => (
                <div 
                  key={`i-owe-${index}`}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {relationship.creditorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{relationship.creditorName}</p>
                      <p className="text-sm text-muted-foreground">you owe them</p>
                    </div>
                    <Badge variant="destructive">
                      {formatCurrency(relationship.amount)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time to settle up! 💸
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other relationships in the group */}
        {otherRelationships.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 text-sm text-muted-foreground">Other debts in group</h3>
            <div className="space-y-2">
              {otherRelationships.slice(0, 3).map((relationship, index) => (
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
              {otherRelationships.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{otherRelationships.length - 3} more relationships
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
