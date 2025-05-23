
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserSplitData } from "@/types/expenses";
import SplitSummary from "./SplitSummary";

interface SplitMethodDisplayProps {
  splitData: UserSplitData[];
  totalAmount: number;
  paidBy: string;
  getCalculatedAmount: (userData: UserSplitData) => number;
  getUserName: (userData: UserSplitData) => string;
  splitMethod: string;
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  handleInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
}

const SplitMethodDisplay: React.FC<SplitMethodDisplayProps> = ({
  splitData,
  totalAmount,
  paidBy,
  getCalculatedAmount,
  getUserName,
  splitMethod,
  selectedUsers,
  toggleUser,
  handleInputChange,
  adjustShares
}) => {
  return (
    <Card>
      <CardContent className="pt-4 pb-2 overflow-x-auto">
        <SplitSummary
          splitData={splitData}
          totalAmount={totalAmount}
          paidBy={paidBy}
          getCalculatedAmount={getCalculatedAmount}
          getUserName={getUserName}
          splitMethod={splitMethod}
          selectedUsers={selectedUsers}
          toggleUser={toggleUser}
          onInputChange={handleInputChange}
          adjustShares={adjustShares}
        />
      </CardContent>
    </Card>
  );
};

export default SplitMethodDisplay;
