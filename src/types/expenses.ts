
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
