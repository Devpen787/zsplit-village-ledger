import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { BalanceData } from './BalancesTable';
import { useDebtRelationships, DebtRelationship } from './debt-relationships/useDebtRelationships';
import { DebtSection } from './debt-relationships/DebtSection';
import { toast } from '@/components/ui/sonner';

interface DebtRelationshipsProps {
  balances: BalanceData[];
  onSendReminder: (relationship: DebtRelationship) => void;
}

export const DebtRelationships = ({ balances, onSendReminder }: DebtRelationshipsProps) => {
  const { 
    debtRelationships, 
    peopleWhoOweMe, 
    peopleIOweTo, 
    otherRelationships 
  } = useDebtRelationships(balances);

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
        <DebtSection
          title="💰 People who owe you money"
          subtitle=""
          relationships={peopleWhoOweMe}
          variant="user-creditor"
          containerClassName="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800"
          onSendReminder={handleSendReminder}
        />

        {/* People I OWE money to */}
        <DebtSection
          title="💳 People you owe money to"
          subtitle=""
          relationships={peopleIOweTo}
          variant="user-debtor"
          containerClassName="bg-red-50/50 dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800"
        />

        {/* Other relationships in the group */}
        <DebtSection
          title="Other debts in group"
          subtitle=""
          relationships={otherRelationships}
          variant="other"
          containerClassName=""
          maxDisplay={3}
        />
      </CardContent>
    </Card>
  );
};
