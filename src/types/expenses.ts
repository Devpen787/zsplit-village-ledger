
export type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
  paid_by_user?: {
    name: string | null;
    email: string;
    display_name?: string | null;
  };
  group_name?: string | null;
  leftover_notes?: string | null;
  group_id?: string | null;
};

export type ExpenseSplitData = {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
};

export type ExpenseMember = {
  id: string;
  expense_id: string;
  user_id: string;
  share_type: 'equal' | 'amount' | 'percentage' | 'shares';
  share_value: number;
  share: number;
  paid_status?: boolean;
};

export type ExpensesListProps = {
  limit?: number;
  groupId?: string;
};

export type SplitMethod = 'equal' | 'amount' | 'percentage' | 'shares';

// Enhanced UserSplitData type with user details
export type UserSplitData = {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
  isActive?: boolean;
  // Add user details for better name rendering
  email?: string | null;
  name?: string | null;
  display_name?: string | null;
};

// Define a common User type for expense-related components
export type ExpenseUser = {
  id: string;
  name?: string | null;
  email: string | null;
  display_name?: string | null;
  group_id?: string | null;
  isActive?: boolean;
};
