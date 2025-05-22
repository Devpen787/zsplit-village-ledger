
import React from 'react';
import { ExpensesList } from "@/components/ExpensesList";

interface ExpensesTabProps {
  groupId: string;
}

export const ExpensesTab = ({ groupId }: ExpensesTabProps) => {
  return <ExpensesList groupId={groupId} />;
};
