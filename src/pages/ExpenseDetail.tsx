
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

type ExpenseMember = {
  id: string;
  name: string | null;
  email: string;
  share_value: number;
  paid_status: boolean;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
  payer_name: string;
  notes: string | null;
  members: ExpenseMember[];
};

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchExpenseDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the expense
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select(`
          id, title, amount, currency, date, paid_by, leftover_notes
        `)
        .eq('id', id)
        .single();
        
      if (expenseError) throw new Error(expenseError.message);
      if (!expenseData) throw new Error('Expense not found');
      
      // Fetch the payer's information
      const { data: payerData, error: payerError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', expenseData.paid_by)
        .single();
        
      // Fetch the expense members with their user information
      const { data: membersData, error: membersError } = await supabase
        .from('expense_members')
        .select(`
          id, share_value, paid_status,
          user:user_id (
            id, name, email
          )
        `)
        .eq('expense_id', id);
        
      if (membersError) throw new Error(membersError.message);
      
      // Format the expense with all its details
      const formattedExpense: Expense = {
        id: expenseData.id,
        title: expenseData.title || 'Unnamed Expense',
        amount: expenseData.amount || 0,
        currency: expenseData.currency || 'CHF',
        date: expenseData.date || new Date().toISOString(),
        paid_by: expenseData.paid_by,
        payer_name: payerData?.name || payerData?.email?.split('@')[0] || 'Unknown',
        notes: expenseData.leftover_notes,
        members: membersData.map((member: any) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          share_value: member.share_value || 0,
          paid_status: member.paid_status || false,
        }))
      };
      
      setExpense(formattedExpense);
    } catch (err) {
      console.error('Error fetching expense details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
    
    // Set up realtime subscription for expense members
    const expenseMembersChannel = supabase
      .channel('expense-members-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expense_members', filter: `expense_id=eq.${id}` },
        () => fetchExpenseDetails()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expenseMembersChannel);
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      
      // Delete the expense (cascade will handle expense_members)
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("Expense deleted successfully");
      navigate('/');
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error("Failed to delete expense");
      setIsDeleting(false);
    }
  };

  const handleMarkAllAsPaid = async () => {
    if (!id || !expense) return;
    
    try {
      const { error } = await supabase
        .from('expense_members')
        .update({ paid_status: true })
        .eq('expense_id', id);
        
      if (error) throw error;
      
      toast.success("All members marked as paid");
      fetchExpenseDetails();
    } catch (err) {
      console.error('Error marking all as paid:', err);
      toast.error("Failed to update payment status");
    }
  };

  const togglePaidStatus = async (memberId: string, currentStatus: boolean) => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('expense_members')
        .update({ paid_status: !currentStatus })
        .eq('expense_id', id)
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      toast.success(`Member marked as ${!currentStatus ? 'paid' : 'unpaid'}`);
      fetchExpenseDetails();
    } catch (err) {
      console.error('Error toggling paid status:', err);
      toast.error("Failed to update payment status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Expense not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{expense.title}</h1>
        <p className="text-muted-foreground">
          {new Date(expense.date).toLocaleDateString()}
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total amount</span>
              <span className="font-bold">
                {Number(expense.amount).toFixed(2)} {expense.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid by</span>
              <span>{expense.payer_name}</span>
            </div>
            {expense.notes && (
              <div className="pt-2 border-t border-border">
                <span className="block text-sm text-muted-foreground mb-1">Notes</span>
                <p className="text-sm">{expense.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-medium mb-3">Who owes what</h2>

      <Card className="mb-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expense.members.map((member) => (
              <TableRow key={member.id} onClick={() => togglePaidStatus(member.id, member.paid_status)} className="cursor-pointer">
                <TableCell className="font-medium">
                  {member.name || member.email.split('@')[0]}
                </TableCell>
                <TableCell className="text-right">
                  {Number(member.share_value).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={member.paid_status ? "success" : "outline"}>
                    {member.paid_status ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this expense and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleMarkAllAsPaid}>Mark all as paid</Button>
      </div>
    </div>
  );
};

export default ExpenseDetail;
