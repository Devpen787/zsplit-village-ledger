
import React from "react";
import SplitMethodSelector from "./split-methods/SplitMethodSelector";
import SplitInputs from "./split-methods/SplitInputs";
import SplitSummary from "./split-methods/SplitSummary";
import ValidationAlert from "./split-methods/ValidationAlert";
import { UserSplitData } from "@/types/expenses";
import { useExpenseSplit } from "@/hooks/useExpenseSplit";

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

  return (
    <div className="space-y-4">
      <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
      <ValidationAlert validationError={validationError} />
      
      {/* This is the input section for each split method */}
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
      
      {/* This is the summary table that should be the ONLY table */}
      <SplitSummary 
        splitData={splitData}
        totalAmount={totalAmount}
        paidBy={paidBy}
        getCalculatedAmount={getCalculatedAmount}
        getUserName={getUserName}
        splitMethod={splitMethod}
      />
    </div>
  );
};

export default ExpenseSplitMethodFields;
