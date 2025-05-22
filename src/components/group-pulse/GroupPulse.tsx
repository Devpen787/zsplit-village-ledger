
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWallet } from '@/contexts/WalletContext';
import WalletInfo from '@/components/wallet/WalletInfo';
import { PendingPayoutRequestsList } from './PendingPayoutRequestsList';
import { useGroupPulse } from '@/hooks/useGroupPulse';

export const GroupPulse = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const {
    loading,
    potBalance,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    pendingPayoutsCount,
    averageApprovalTime,
    pendingRequests,
    connectedWalletsCount,
    totalMembersCount,
    handleApproveRequest,
    handleRejectRequest,
    isAdmin
  } = useGroupPulse(groupId);
  
  // This will be replaced with actual data from your API
  const groupStats = {
    potBalance: potBalance || 500,
    totalExpenses: 1200,
    expensesPaid: 950,
    expensesUnpaid: 250,
    contributionRate: 80
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Group Financial Pulse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              View group financial activity and statistics. Connect a wallet for additional features like submitting or approving payouts.
            </p>
            
            <div className="p-4 border rounded-md bg-muted/30">
              <WalletInfo 
                showLabel={true} 
                showMessage={true} 
                labelPrefix="Wallet: " 
                showConnectingState={false}
                connectMessage="Connect your wallet to submit payout requests or receive reimbursements."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial metrics shown to all users regardless of wallet connection */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pot Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${groupStats.potBalance.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Available for group expenses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expenses Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Paid: ${groupStats.expensesPaid.toFixed(2)}</span>
              <span>Unpaid: ${groupStats.expensesUnpaid.toFixed(2)}</span>
            </div>
            <Progress value={groupStats.expensesPaid / groupStats.totalExpenses * 100} />
            <p className="text-sm text-muted-foreground">
              {(groupStats.expensesPaid / groupStats.totalExpenses * 100).toFixed(0)}% of expenses settled
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6">
        {/* Pending requests are shown only if there are any and the user has wallet connected with admin privileges */}
        {isConnected && isAdmin && pendingRequests && pendingRequests.length > 0 && (
          <PendingPayoutRequestsList
            pendingRequests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
          />
        )}
      </div>
    </div>
  );
};
