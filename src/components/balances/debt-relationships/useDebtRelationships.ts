
import React from 'react';
import { BalanceData } from '../BalancesTable';
import { useAuth } from '@/contexts';

export interface DebtRelationship {
  creditorId: string;
  creditorName: string;
  debtorId: string;
  debtorName: string;
  amount: number;
  isUserInvolved: boolean;
  isUserCreditor: boolean;
  isUserDebtor: boolean;
}

export const useDebtRelationships = (balances: BalanceData[]) => {
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

  return {
    debtRelationships,
    userRelationships,
    peopleWhoOweMe,
    peopleIOweTo,
    otherRelationships
  };
};
