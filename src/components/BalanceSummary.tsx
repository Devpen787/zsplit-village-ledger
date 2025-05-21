
import { Card, CardContent } from "@/components/ui/card";

export const BalanceSummary = () => {
  // This will be replaced with real data from Supabase once integrated
  const mockBalance = {
    totalPositive: 125.50,
    totalNegative: -45.75,
    netBalance: 79.75,
    currency: "CHF"
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">You are owed</span>
            <span className="font-medium text-green-600">
              {mockBalance.totalPositive.toFixed(2)} {mockBalance.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">You owe</span>
            <span className="font-medium text-red-600">
              {Math.abs(mockBalance.totalNegative).toFixed(2)} {mockBalance.currency}
            </span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-center">
            <span className="font-medium">Net balance</span>
            <span 
              className={`font-bold ${
                mockBalance.netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {mockBalance.netBalance.toFixed(2)} {mockBalance.currency}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
