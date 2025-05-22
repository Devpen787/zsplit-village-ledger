
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts';
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSummary = () => {
  const { user } = useAuth();

  // Query for user's expenses
  const { data: myExpensesData, isLoading: myExpensesLoading } = useQuery({
    queryKey: ['my-expenses-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, total: 0 };
      
      // Get expenses paid by the current user
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('paid_by', user?.id);
      
      if (error) throw error;
      
      const total = data.reduce((sum, expense) => sum + Number(expense.amount), 0);
      return { count: data.length, total };
    },
    enabled: !!user?.id,
  });

  // Query for all expenses the user is involved in
  const { data: totalExpensesData, isLoading: totalExpensesLoading } = useQuery({
    queryKey: ['all-expenses-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, total: 0 };
      
      // Get all expenses where user is a member
      const { data: expenseMemberships, error } = await supabase
        .from('expense_members')
        .select('expense_id')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      if (expenseMemberships.length === 0) {
        return { count: 0, total: 0 };
      }
      
      // Get the actual expenses
      const expenseIds = expenseMemberships.map(em => em.expense_id);
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .in('id', expenseIds);
      
      if (expensesError) throw expensesError;
      
      const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      return { count: expenses.length, total };
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* My Expenses Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">My Expenses</h3>
                {myExpensesLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <p className="text-2xl font-bold">
                    {formatCurrency(myExpensesData?.total || 0)}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
              {myExpensesLoading ? (
                <Skeleton className="h-4 w-8" />
              ) : (
                <span>{myExpensesData?.count || 0} expenses</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                {totalExpensesLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalExpensesData?.total || 0)}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
              {totalExpensesLoading ? (
                <Skeleton className="h-4 w-8" />
              ) : (
                <span>{totalExpensesData?.count || 0} expenses</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
