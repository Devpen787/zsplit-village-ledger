
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts';
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Receipt, UsersRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSummary = () => {
  const { user } = useAuth();

  // Query for user's expenses (expenses they personally paid)
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

  // Query for all expenses from groups the user is a member of
  const { data: groupExpensesData, isLoading: groupExpensesLoading } = useQuery({
    queryKey: ['group-expenses-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, total: 0, groupCount: 0 };
      
      // First, get all groups the user is a member of
      const { data: userGroups, error: groupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user?.id);
      
      if (groupsError) throw groupsError;
      
      if (!userGroups || userGroups.length === 0) {
        return { count: 0, total: 0, groupCount: 0 };
      }
      
      const groupIds = userGroups.map(g => g.group_id);
      
      // Get all expenses from these groups
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .in('group_id', groupIds);
      
      if (expensesError) throw expensesError;
      
      const total = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      return { 
        count: expenses?.length || 0, 
        total, 
        groupCount: groupIds.length 
      };
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

      {/* Total Group Expenses Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
                {groupExpensesLoading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <p className="text-2xl font-bold">
                    {formatCurrency(groupExpensesData?.total || 0)}
                  </p>
                )}
                {/* Display the group count */}
                {!groupExpensesLoading && groupExpensesData?.groupCount > 0 && (
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <UsersRound className="h-3 w-3 mr-1" />
                    <span>across {groupExpensesData?.groupCount} {groupExpensesData?.groupCount === 1 ? 'group' : 'groups'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
              {groupExpensesLoading ? (
                <Skeleton className="h-4 w-8" />
              ) : (
                <span>{groupExpensesData?.count || 0} expenses</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
