
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
};

export type ExpensesListProps = {
  limit?: number;
  groupId?: string;
};
