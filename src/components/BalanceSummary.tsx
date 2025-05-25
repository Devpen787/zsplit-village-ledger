
import { Card, CardContent } from "@/components/ui/card";
import { useBalances } from "@/hooks/useBalances";
import { useAuth } from "@/contexts";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/money";
import { LoadingCenter } from "@/components/ui/loading";
import { useMemo } from "react";

export const BalanceSummary = () => {
  const { balances, loading, error, hasRecursionError, handleRefresh, isEmpty } = useBalances();
  const { user } = useAuth();

  // Memoize summary calculation for performance
  const summary = useMemo(() => {
    const currentUserBalance = balances.find(balance => balance.user_id === user?.id);
    
    const defaultSummary = {
      totalPositive: 0,
      totalNegative: 0,
      netBalance: 0,
      currency: "CHF"
    };

    if (!currentUserBalance) return defaultSummary;

    const amount = currentUserBalance.amount;
    
    return {
      totalPositive: amount > 0 ? amount : 0,
      totalNegative: amount < 0 ? amount : 0,
      netBalance: amount,
      currency: "CHF"
    };
  }, [balances, user?.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <LoadingCenter text="Loading balances..." />
        </CardContent>
      </Card>
    );
  }

  if (error && !hasRecursionError) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              {error}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasRecursionError) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Balance data unavailable
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              There's a database configuration issue preventing access to your balance information. 
              This will be resolved soon.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              className="w-full flex items-center justify-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <span className="text-sm">No balance data available</span>
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
              {formatCurrency(summary.totalPositive, summary.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">You owe</span>
            <span className="font-medium text-red-600">
              {formatCurrency(Math.abs(summary.totalNegative), summary.currency)}
            </span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-center">
            <span className="font-medium">Net balance</span>
            <span 
              className={`font-bold ${
                summary.netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(summary.netBalance, summary.currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
