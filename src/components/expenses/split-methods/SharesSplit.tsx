
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserSplitData } from "@/types/expenses";

interface SharesSplitProps {
  splitData: UserSplitData[];
  users: Array<{ id: string; name?: string | null; email: string | null }>;
  totalAmount: number;
  paidBy: string;
  onInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
  getCalculatedAmount: (userData: UserSplitData) => number;
  getTotalShares: () => number;
}

const SharesSplit: React.FC<SharesSplitProps> = ({
  splitData,
  users,
  totalAmount,
  paidBy,
  onInputChange,
  adjustShares,
  getCalculatedAmount,
  getTotalShares,
}) => {
  const totalShares = getTotalShares();
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-4 pb-2">
        <div className="text-sm text-muted-foreground mb-4">
          Total parts: {totalShares}
        </div>
        
        {splitData.map((data) => {
          const user = users.find(u => u.id === data.userId);
          const calculatedAmount = getCalculatedAmount(data);
          
          return (
            <div key={data.userId} className="flex items-center justify-between mb-3">
              <Label htmlFor={`shares-${data.userId}`} className="w-1/3">
                {user?.name || user?.email}
              </Label>
              <div className="flex items-center w-2/3">
                <div className="flex-1 flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adjustShares(data.userId, -1)}
                    disabled={(data.shares || 0) <= 1}
                    className="mr-2 px-2"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    id={`shares-${data.userId}`}
                    type="number"
                    min="1"
                    value={data.shares || ""}
                    onChange={(e) => onInputChange(data.userId, e.target.value, 'shares')}
                    className={cn(
                      "flex-1 mx-1 text-center",
                      data.userId === paidBy ? "border-green-400" : ""
                    )}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adjustShares(data.userId, 1)}
                    className="ml-2 px-2"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground ml-3 whitespace-nowrap">
                  = {calculatedAmount.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SharesSplit;
