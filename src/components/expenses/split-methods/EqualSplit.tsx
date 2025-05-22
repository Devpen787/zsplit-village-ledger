
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { UserSplitData } from "@/types/expenses";

interface EqualSplitProps {
  splitData: UserSplitData[];
  totalAmount: number;
  users: Array<{ id: string; name?: string | null; email: string | null }>;
}

const EqualSplit: React.FC<EqualSplitProps> = ({ splitData, totalAmount, users }) => {
  const calculateEqualSplit = (): number => {
    if (users.length === 0 || !totalAmount) return 0;
    return parseFloat((totalAmount / users.length).toFixed(2));
  };

  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.name || user?.email || "User";
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-4 pb-2">
        <div className="text-sm text-green-600 mb-4 flex items-center">
          <Check className="h-4 w-4 mr-2" />
          Each person will pay {calculateEqualSplit().toFixed(2)}
        </div>
        
        {splitData.map((data) => {
          const userName = getUserName(data.userId);
          return (
            <div key={data.userId} className="flex items-center justify-between mb-3">
              <div className="w-1/2">
                {userName} pays:
              </div>
              <div className="w-1/2 text-right font-medium">
                {calculateEqualSplit().toFixed(2)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EqualSplit;
