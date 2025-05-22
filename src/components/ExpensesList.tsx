
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
  groupId?: string;
};

export const ExpensesList = ({ limit, groupId }: ExpensesListProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupedExpenses, setGroupedExpenses] = useState<Record<string, Expense[]>>({});

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      console.log("Fetching expenses", { limit, groupId, userId: user?.id });
      
      // Build the query
      let query = (supabase
        .from('expenses') as any)
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
        
      // Add group filter if provided
      if (groupId) {
        query = query.eq('group_id', groupId);
      }
        
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }

      console.log("Expenses data:", data);

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
      
      // Group expenses by date
      const grouped = formattedExpenses.reduce((acc: Record<string, Expense[]>, expense) => {
        // Format the date as YYYY-MM-DD
        const dateKey = new Date(expense.date).toISOString().split('T')[0];
        
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        
        acc[dateKey].push(expense);
        return acc;
      }, {});
      
      setGroupedExpenses(grouped);
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
  }, [limit, groupId]);

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    
    // Get today and yesterday dates for comparison
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the date is today or yesterday
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      // Format as Month Day, Year
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const getExpenseEmoji = (title: string) => {
    // Map common expense categories to emojis
    const emojiMap: {[key: string]: string} = {
      'food': '🍽️',
      'lunch': '🥗',
      'dinner': '🍲',
      'breakfast': '🍳',
      'coffee': '☕',
      'drinks': '🍹',
      'beer': '🍺',
      'wine': '🍷',
      'groceries': '🛒',
      'transport': '🚕',
      'taxi': '🚖',
      'uber': '🚗',
      'hotel': '🏨',
      'accomodation': '🏡',
      'tickets': '🎟️',
      'movie': '🎬',
      'entertainment': '🎭',
      'shopping': '🛍️',
      'gift': '🎁',
      'gas': '⛽',
      'fuel': '⛽',
      'pharmacy': '💊',
      'medicine': '💊',
      'flight': '✈️',
      'train': '🚆',
      'bus': '🚌',
      'cake': '🍰',
      'dessert': '🍨'
    };
    
    // Check if any of the keywords exist in the title
    const lowercaseTitle = title.toLowerCase();
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (lowercaseTitle.includes(keyword)) {
        return emoji;
      }
    }
    
    // Default emoji
    return '💰';
  };
  
  const handleCreateExpense = () => {
    if (groupId) {
      navigate(`/expenses/new?groupId=${groupId}`);
    } else {
      navigate('/expenses/new');
    }
  };
  
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
          <div className="flex flex-col items-center space-y-3 py-4">
            <div className="rounded-full bg-secondary w-12 h-12 flex items-center justify-center">
              <PlusCircle className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="font-medium">No expenses yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first expense to start tracking
            </p>
            <Button onClick={handleCreateExpense} className="mt-2">
              Add Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedExpenses)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .map(([date, dateExpenses]) => (
          <div key={date} className="space-y-2">
            <h3 className="text-md font-medium text-muted-foreground mb-2">
              {formatDateForDisplay(date)}
            </h3>
            <div className="space-y-2">
              {dateExpenses.map((expense) => (
                <Link to={`/expenses/${expense.id}`} key={expense.id}>
                  <Card className="hover:bg-secondary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                            {getExpenseEmoji(expense.title)}
                          </div>
                          <div>
                            <h4 className="font-medium">{expense.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Paid by {expense.paid_by_user?.name || expense.paid_by_user?.email.split('@')[0] || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {Number(expense.amount).toFixed(2)} {expense.currency}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};
