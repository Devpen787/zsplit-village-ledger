
import React from "react";
import EqualSplit from "./EqualSplit";
import AmountSplit from "./AmountSplit";
import PercentageSplit from "./PercentageSplit";
import SharesSplit from "./SharesSplit";
import { UserSplitData } from "@/types/expenses";

type User = {
  id: string;
  name?: string | null;
  email: string | null;
};

interface SplitInputsProps {
  splitMethod: string;
  splitData: UserSplitData[];
  users: User[];
  totalAmount: number;
  paidBy: string;
  onInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
  getCalculatedAmount: (userData: UserSplitData) => number;
  getTotalShares: () => number;
}

const SplitInputs: React.FC<SplitInputsProps> = ({
  splitMethod,
  splitData,
  users,
  totalAmount,
  paidBy,
  onInputChange,
  adjustShares,
  getCalculatedAmount,
  getTotalShares
}) => {
  // Render appropriate split inputs based on method
  const renderSplitInputs = () => {
    switch (splitMethod) {
      case "equal":
        return (
          <EqualSplit 
            splitData={splitData} 
            totalAmount={totalAmount} 
            users={users} 
          />
        );
      
      case "amount":
        return (
          <AmountSplit 
            splitData={splitData} 
            users={users} 
            totalAmount={totalAmount} 
            paidBy={paidBy} 
            onInputChange={onInputChange} 
          />
        );
      
      case "percentage":
        return (
          <PercentageSplit 
            splitData={splitData} 
            users={users} 
            totalAmount={totalAmount} 
            paidBy={paidBy} 
            onInputChange={onInputChange} 
            getCalculatedAmount={getCalculatedAmount} 
          />
        );
      
      case "shares":
        return (
          <SharesSplit 
            splitData={splitData} 
            users={users} 
            totalAmount={totalAmount} 
            paidBy={paidBy} 
            onInputChange={onInputChange} 
            adjustShares={adjustShares} 
            getCalculatedAmount={getCalculatedAmount} 
            getTotalShares={getTotalShares} 
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="py-2">
      {renderSplitInputs()}
    </div>
  );
};

export default SplitInputs;
