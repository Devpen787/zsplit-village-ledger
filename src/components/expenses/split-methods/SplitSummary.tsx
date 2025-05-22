
import React from "react";
import { UserSplitData } from "@/types/expenses";

interface SplitSummaryProps {
  splitData: UserSplitData[];
  totalAmount: number;
  paidBy: string;
  getCalculatedAmount: (userData: UserSplitData) => number;
  getUserName: (userId: string) => string;
}

const SplitSummary: React.FC<SplitSummaryProps> = ({
  splitData,
  totalAmount,
  paidBy,
  getCalculatedAmount,
  getUserName,
}) => {
  if (!totalAmount || totalAmount <= 0) return null;
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Payment Summary</h4>
      <div className="text-sm space-y-1">
        {splitData.map((data) => {
          const userName = getUserName(data.userId);
          const amount = getCalculatedAmount(data);
          
          return (
            <div key={data.userId} className="flex justify-between">
              <span className={data.userId === paidBy ? "font-medium text-green-600" : ""}>
                {userName} {data.userId === paidBy ? "(paid)" : "pays"}
              </span>
              <span>{amount.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SplitSummary;
