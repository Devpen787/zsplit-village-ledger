
// This file is now obsolete as we're consolidating the UI and removing duplicate components
// The functionality has been integrated into the ExpenseSplitMethodFields component
import React from "react";
import { ExpenseUser } from "@/types/expenses";

interface ExpenseParticipantsSelectorProps {
  users: ExpenseUser[];
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  paidBy: string;
  groupId?: string | null;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectGroup: (groupId: string) => void; 
  formatUserName: (user: ExpenseUser) => string;
}

// This component is now deprecated and has been replaced by unified UI in ExpenseSplitMethodFields
const ExpenseParticipantsSelector: React.FC<ExpenseParticipantsSelectorProps> = () => {
  return null; // Component removed as part of UI unification
};

export default ExpenseParticipantsSelector;
