
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSplitData } from "@/types/expenses";
import { formatAmount } from "@/utils/money";

interface AmountSplitProps {
  splitData: UserSplitData[];
  users: Array<{ id: string; name?: string | null; email: string | null }>;
  totalAmount: number;
  paidBy: string;
  onInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
}

const AmountSplit: React.FC<AmountSplitProps> = ({
  splitData,
  users,
  totalAmount,
  paidBy,
  onInputChange,
}) => {
  const amountTotal = splitData.reduce((sum, item) => sum + (item.amount || 0), 0);
  const amountDiff = totalAmount - amountTotal;

  return (
    <div className="space-y-4">
      <div className={cn(
        "text-sm mb-4 flex items-center",
        Math.abs(amountDiff) < 0.01 ? "text-green-600" : "text-amber-600"
      )}>
        {Math.abs(amountDiff) < 0.01 ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Amounts add up correctly
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            {amountDiff > 0 ? `${formatAmount(amountDiff)} left to assign` : `Exceeds total by ${formatAmount(Math.abs(amountDiff))}`}
          </>
        )}
      </div>
      
      {splitData.map((data) => {
        const user = users.find(u => u.id === data.userId);
        return (
          <div key={data.userId} className="flex items-center justify-between mb-3">
            <Label htmlFor={`amount-${data.userId}`} className="w-1/3">
              {user?.name || user?.email}
            </Label>
            <Input
              id={`amount-${data.userId}`}
              type="number"
              step="0.01"
              min="0"
              value={data.amount || ""}
              onChange={(e) => onInputChange(data.userId, e.target.value, 'amount')}
              className={cn(
                "w-2/3",
                data.userId === paidBy ? "border-green-400" : ""
              )}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AmountSplit;
