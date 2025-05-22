
import { Card, CardContent } from "@/components/ui/card";
import { useBalances } from "@/hooks/useBalances";
import { useAuth } from "@/contexts";

export const BalanceSummary = () => {
  const { balances, loading } = useBalances();
  const { user } = useAuth();

  // Calculate summary data for the current user
  const currentUserBalance = balances.find(balance => balance.user_id === user?.id);
  
  const summary = {
    totalPositive: 0,
    totalNegative: 0,
    netBalance: 0,
    currency: "CHF"
  };

  if (currentUserBalance) {
    if (currentUserBalance.amount > 0) {
      summary.totalPositive = currentUserBalance.amount;
      summary.netBalance = currentUserBalance.amount;
    } else if (currentUserBalance.amount < 0) {
      summary.totalNegative = currentUserBalance.amount;
      summary.netBalance = currentUserBalance.amount;
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Loading balances...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">You are owed</span>
            <span className="font-medium text-green-600">
              {summary.totalPositive.toFixed(2)} {summary.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">You owe</span>
            <span className="font-medium text-red-600">
              {Math.abs(summary.totalNegative).toFixed(2)} {summary.currency}
            </span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-center">
            <span className="font-medium">Net balance</span>
            <span 
              className={`font-bold ${
                summary.netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summary.netBalance.toFixed(2)} {summary.currency}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
