
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BalancePaymentSuggestions } from '@/components/BalancePaymentSuggestions';
import { Badge } from '@/components/ui/badge';

type User = {
  id: string;
  name: string | null;
  email: string;
};

type BalanceData = {
  userId: string;
  userName: string | null;
  amountPaid: number;
  amountOwed: number;
  netBalance: number;
};

const Balances = () => {
  const [balances, setBalances] = useState<BalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all users in the group
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('group_name', user?.group_name || '');
      
      if (usersError) throw new Error(usersError.message);
      
      // Fetch all expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('id, amount, paid_by');
        
      if (expensesError) throw new Error(expensesError.message);
      
      // Fetch expense members to calculate how much each person owes
      const { data: expenseMembers, error: membersError } = await supabase
        .from('expense_members')
        .select('expense_id, user_id, share_value');
        
      if (membersError) throw new Error(membersError.message);

      // Initialize balance data for each user
      const balanceMap = new Map<string, BalanceData>();
      
      users?.forEach((user) => {
        balanceMap.set(user.id, {
          userId: user.id,
          userName: user.name || user.email.split('@')[0],
          amountPaid: 0,
          amountOwed: 0,
          netBalance: 0
        });
      });
      
      // Calculate how much each person paid
      expenses?.forEach((expense) => {
        if (expense.paid_by && balanceMap.has(expense.paid_by)) {
          const userData = balanceMap.get(expense.paid_by);
          if (userData) {
            userData.amountPaid += Number(expense.amount || 0);
            balanceMap.set(expense.paid_by, userData);
          }
        }
      });
      
      // Calculate how much each person owes
      expenseMembers?.forEach((member) => {
        if (member.user_id && balanceMap.has(member.user_id)) {
          const userData = balanceMap.get(member.user_id);
          if (userData) {
            userData.amountOwed += Number(member.share_value || 0);
            balanceMap.set(member.user_id, userData);
          }
        }
      });
      
      // Calculate net balance for each user
      balanceMap.forEach((userData, userId) => {
        userData.netBalance = userData.amountPaid - userData.amountOwed;
        balanceMap.set(userId, userData);
      });
      
      setBalances(Array.from(balanceMap.values()));
    } catch (err) {
      console.error('Error calculating balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to load balances');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    calculateBalances();

    // Set up realtime subscription for expenses and expense_members
    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => calculateBalances()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expense_members' },
        () => calculateBalances()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
    };
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    calculateBalances();
    toast({
      title: "Balances refreshed",
      description: "The latest balance information has been loaded"
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="pl-0 mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Balances</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Current Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Total Owed</TableHead>
                <TableHead className="text-right">Net Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((balance) => (
                <TableRow key={balance.userId}>
                  <TableCell className="font-medium">{balance.userName}</TableCell>
                  <TableCell className="text-right">{balance.amountPaid.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{balance.amountOwed.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={balance.netBalance > 0 ? "success" : balance.netBalance < 0 ? "destructive" : "outline"} className="font-mono">
                      {balance.netBalance.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BalancePaymentSuggestions balances={balances} />
    </div>
  );
};

export default Balances;
