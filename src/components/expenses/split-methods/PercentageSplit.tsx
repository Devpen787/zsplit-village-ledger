
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSplitData } from "@/types/expenses";

interface PercentageSplitProps {
  splitData: UserSplitData[];
  users: Array<{ id: string; name?: string | null; email: string | null }>;
  totalAmount: number;
  paidBy: string;
  onInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  getCalculatedAmount: (userData: UserSplitData) => number;
}

const PercentageSplit: React.FC<PercentageSplitProps> = ({
  splitData,
  users,
  totalAmount,
  paidBy,
  onInputChange,
  getCalculatedAmount,
}) => {
  const percentageTotal = splitData.reduce((sum, item) => sum + (item.percentage || 0), 0);
  const percentageDiff = 100 - percentageTotal;

  return (
    <div className="space-y-4">
      <div className={cn(
        "text-sm mb-4 flex items-center",
        Math.abs(percentageDiff) < 0.01 ? "text-green-600" : "text-amber-600"
      )}>
        {Math.abs(percentageDiff) < 0.01 ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Percentages add up to 100%
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            {percentageDiff > 0 ? `${percentageDiff.toFixed(1)}% left to assign` : `Exceeds 100% by ${Math.abs(percentageDiff).toFixed(1)}%`}
          </>
        )}
      </div>
      
      {splitData.map((data) => {
        const user = users.find(u => u.id === data.userId);
        const calculatedAmount = getCalculatedAmount(data);
        
        return (
          <div key={data.userId} className="flex items-center justify-between mb-3">
            <Label htmlFor={`percentage-${data.userId}`} className="w-1/3">
              {user?.name || user?.email}
            </Label>
            <div className="flex items-center w-2/3">
              <div className="flex-1 flex items-center">
                <Input
                  id={`percentage-${data.userId}`}
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={data.percentage || ""}
                  onChange={(e) => onInputChange(data.userId, e.target.value, 'percentage')}
                  className={cn(
                    "flex-1",
                    data.userId === paidBy ? "border-green-400" : ""
                  )}
                />
                <span className="ml-2 mr-3">%</span>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                = {calculatedAmount.toFixed(2)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PercentageSplit;
