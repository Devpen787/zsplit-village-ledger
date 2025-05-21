
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type Expense = {
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

type ExpensesListProps = {
  limit?: number;
};

export const ExpensesList = ({ limit }: ExpensesListProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      // Fetch expenses with user information for the payer
      const query = supabase
        .from('expenses')
        .select(`
          id,
          title,
          amount,
          currency,
          date,
          paid_by,
          users:paid_by (
            name,
            email
          )
        `)
        .order('date', { ascending: false });
        
      if (limit) {
        query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our Expense type
      const formattedExpenses = data.map((expense: any) => ({
        id: expense.id,
        title: expense.title || 'Unnamed Expense',
        amount: expense.amount || 0,
        currency: expense.currency || 'CHF',
        date: expense.date || new Date().toISOString(),
        paid_by: expense.paid_by,
        paid_by_user: expense.users
      }));

      setExpenses(formattedExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    
    // Set up realtime subscription for expenses
    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => fetchExpenses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
    };
  }, [limit]);
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
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
      {expenses.map((expense) => (
        <Link to={`/expenses/${expense.id}`} key={expense.id}>
          <Card className="hover:bg-secondary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{expense.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Paid by {expense.paid_by_user?.name || expense.paid_by_user?.email.split('@')[0] || 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {Number(expense.amount).toFixed(2)} {expense.currency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
