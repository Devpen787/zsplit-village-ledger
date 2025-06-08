import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, RefreshCw, Calculator, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalancesTable } from "@/components/balances/BalancesTable";
import { SettlementActions } from "@/components/balances/settlements/SettlementActions";
import { motion } from "framer-motion";
import { useBalances } from "@/hooks/adapters/useBalances";

const Balances = () => {
  const { 
    balances, 
    loading, 
    error, 
    refreshing, 
    hasRecursionError, 
    handleRefresh,
    isEmpty,
    totalUsers
  } = useBalances();

  const transformedBalances = balances.map(balance => ({
    userId: balance.user_id,
    userName: balance.user_name,
    userEmail: balance.user_email,
    amountPaid: 0, // This would need additional calculation
    amountOwed: 0,  // This would need additional calculation
    netBalance: Number(balance.amount) || 0
  }));

  const hasUnsettledBalances = transformedBalances.some(balance => Math.abs(balance.netBalance) > 0.01);
  const totalAmount = transformedBalances.reduce((sum, balance) => sum + Math.abs(balance.netBalance), 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading balances...</p>
        </div>
      </AppLayout>
    );
  }

  if (error && !hasRecursionError) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Loading Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        className="container mx-auto py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Balances</h1>
              <p className="text-muted-foreground">
                Track what everyone owes and is owed
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
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
                <Calculator className="h-8 w-8 text-muted-foreground" />
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

        {/* Error Message for RLS Issues */}
        {hasRecursionError && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Database Configuration Issue</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    There's a Row Level Security policy configuration issue. Showing mock data for now.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEmpty && !hasRecursionError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No balances to show</h3>
              <p className="text-muted-foreground text-center">
                Add some expenses to see balances and settlements here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <BalancesTable balances={transformedBalances} />
            <SettlementActions balances={transformedBalances} />
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Balances;
