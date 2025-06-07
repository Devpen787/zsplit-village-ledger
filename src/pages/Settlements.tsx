
import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts";
import { BalanceData } from "@/components/balances/BalancesTable";
import { SettlementActions } from "@/components/balances/settlements/SettlementActions";
import { SimplifiedPayments } from "@/components/balances/SimplifiedPayments";
import { DebtRelationships } from "@/components/balances/DebtRelationships";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";

const Settlements = () => {
  const { user } = useAuth();

  const { data: balances, isLoading, error, refetch } = useQuery({
    queryKey: ['balances', user?.id],
    queryFn: async () => {
      console.log("[SETTLEMENTS] Fetching balances for settlements page");
      
      const { data, error } = await supabase.rpc('calculate_balances');
      
      if (error) {
        console.error("[SETTLEMENTS] Error fetching balances:", error);
        throw error;
      }
      
      if (!Array.isArray(data)) {
        console.error("[SETTLEMENTS] Invalid data format:", data);
        throw new Error("Invalid data format received");
      }
      
      const formattedBalances: BalanceData[] = data.map(item => ({
        userId: item.user_id,
        userName: item.user_name,
        amountPaid: 0, // This would need to be calculated separately if needed
        amountOwed: 0,  // This would need to be calculated separately if needed
        netBalance: Number(item.amount) || 0
      }));
      
      console.log("[SETTLEMENTS] Formatted balances:", formattedBalances);
      return formattedBalances;
    },
    enabled: !!user
  });

  const handleSendReminder = (relationship: any) => {
    toast.success(`Reminder sent to ${relationship.debtorName}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading settlement data...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Loading Settlement Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Failed to load settlement data. Please try refreshing the page.
              </p>
              <button 
                onClick={() => refetch()}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const hasUnsettledBalances = balances?.some(balance => Math.abs(balance.netBalance) > 0.01) || false;
  const totalUsers = balances?.length || 0;
  const totalAmount = balances?.reduce((sum, balance) => sum + Math.abs(balance.netBalance), 0) || 0;

  return (
    <AppLayout>
      <motion.div 
        className="container mx-auto py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settle Up</h1>
            <p className="text-muted-foreground">
              Manage payments and settle debts with your group members
            </p>
          </div>
        </div>

        {/* Settlement Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {hasUnsettledBalances ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-lg font-bold text-amber-600">Needs Settlement</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-bold text-green-600">All Settled</span>
                      </>
                    )}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total in Transit</p>
                  <p className="text-2xl font-bold">CHF {totalAmount.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {!balances || balances.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Settlement Data</h3>
              <p className="text-muted-foreground text-center">
                No expenses or balances found. Add some expenses to see settlement options.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Settlement Actions */}
            <SettlementActions balances={balances} />
            
            {/* Simplified Payments View */}
            <SimplifiedPayments balances={balances} />
            
            {/* Debt Relationships */}
            <DebtRelationships 
              balances={balances} 
              onSendReminder={handleSendReminder} 
            />
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Settlements;
