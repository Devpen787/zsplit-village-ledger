
import React from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { SplitMethodContainer } from "./split-methods/SplitMethodContainer";

interface ExpenseSplitMethodFieldsProps {
  users: ExpenseUser[];
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  totalAmount: number;
  paidBy: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  groupName?: string | null;
  groupId?: string | null;
}

const ExpenseSplitMethodFields: React.FC<ExpenseSplitMethodFieldsProps> = (props) => {
  return <SplitMethodContainer {...props} />;
};

export default ExpenseSplitMethodFields;
