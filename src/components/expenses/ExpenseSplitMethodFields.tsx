
import React from "react";
import SplitMethodSelector from "./split-methods/SplitMethodSelector";
import SplitInputs from "./split-methods/SplitInputs";
import SplitSummary from "./split-methods/SplitSummary";
import ValidationAlert from "./split-methods/ValidationAlert";
import { UserSplitData } from "@/types/expenses";
import { useExpenseSplit } from "@/hooks/useExpenseSplit";
import { Card, CardContent } from "@/components/ui/card";

type User = {
  id: string;
  name?: string | null;
  email: string | null;
};

interface ExpenseSplitMethodFieldsProps {
  users: User[];
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  totalAmount: number;
  paidBy: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
}

const ExpenseSplitMethodFields: React.FC<ExpenseSplitMethodFieldsProps> = ({
  users,
  splitMethod,
  setSplitMethod,
  totalAmount,
  paidBy,
  onSplitDataChange,
}) => {
  const {
    splitData,
    validationError,
    handleInputChange,
    adjustShares,
    getCalculatedAmount,
    getTotalShares,
    getUserName
  } = useExpenseSplit({
    users,
    totalAmount,
    paidBy,
    splitMethod,
    onSplitDataChange
  });
  
  // If no users are selected, show a message
  if (users.length === 0) {
    return (
      <div className="space-y-4">
        <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
        <div className="text-amber-500 text-center p-4">
          Please select at least one participant to split the expense with.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Split Method Selector */}
      <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
      
      {/* Validation Alert */}
      <ValidationAlert validationError={validationError} />
      
      {/* Split method inputs wrapped in a single card */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <SplitInputs
            splitMethod={splitMethod}
            splitData={splitData}
            users={users}
            totalAmount={totalAmount}
            paidBy={paidBy}
            onInputChange={handleInputChange}
            adjustShares={adjustShares}
            getCalculatedAmount={getCalculatedAmount}
            getTotalShares={getTotalShares}
          />
        </CardContent>
      </Card>
      
      {/* Only show the summary table if we have a valid amount */}
      {totalAmount > 0 && (
        <SplitSummary 
          splitData={splitData}
          totalAmount={totalAmount}
          paidBy={paidBy}
          getCalculatedAmount={getCalculatedAmount}
          getUserName={getUserName}
          splitMethod={splitMethod}
        />
      )}
    </div>
  );
};

export default ExpenseSplitMethodFields;
