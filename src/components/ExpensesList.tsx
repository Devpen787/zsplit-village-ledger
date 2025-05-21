
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
};

type ExpensesListProps = {
  limit?: number;
};

export const ExpensesList = ({ limit }: ExpensesListProps) => {
  // This will be replaced with real data from Supabase once integrated
  const mockExpenses: Expense[] = [
    {
      id: "1",
      title: "Groceries",
      amount: 87.35,
      currency: "CHF",
      date: "2025-05-20",
      paidBy: "Anna"
    },
    {
      id: "2",
      title: "Internet bill",
      amount: 59.90,
      currency: "CHF",
      date: "2025-05-18",
      paidBy: "Michael"
    },
    {
      id: "3",
      title: "Cleaning supplies",
      amount: 23.45,
      currency: "CHF",
      date: "2025-05-15",
      paidBy: "Sarah"
    }
  ];

  const displayExpenses = limit ? mockExpenses.slice(0, limit) : mockExpenses;

  if (displayExpenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No expenses yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {displayExpenses.map((expense) => (
        <Link to={`/expenses/${expense.id}`} key={expense.id}>
          <Card className="hover:bg-secondary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{expense.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Paid by {expense.paidBy} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {expense.amount.toFixed(2)} {expense.currency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
