
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import { AllGroupsStats } from '@/hooks/group-pulse/useCrossGroupStats';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';

interface CrossGroupOverviewProps {
  allGroupsStats: AllGroupsStats | null;
}

export const CrossGroupOverview = ({ allGroupsStats }: CrossGroupOverviewProps) => {
  const { itemVariants } = useAnimations();

  return (
    <motion.div variants={itemVariants} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>All Groups Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Total Groups</p>
              <p className="text-2xl font-bold">{allGroupsStats?.totalGroups || '...'}</p>
            </div>
            
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Total Pot Balance</p>
              <p className="text-2xl font-bold">CHF {allGroupsStats?.totalPotBalance?.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Total Pending Payouts</p>
              <p className="text-2xl font-bold">{allGroupsStats?.totalPendingPayouts || '0'}</p>
            </div>
          </div>
          
          {!allGroupsStats ? (
            <div className="flex items-center justify-center p-6 mt-6">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-muted-foreground">Loading cross-group statistics...</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      {allGroupsStats?.groupComparisons ? (
        <Card>
          <CardHeader>
            <CardTitle>Group Comparisons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allGroupsStats.groupComparisons.map((group) => (
                <div key={group.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.membersCount} members</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">CHF {group.potBalance.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{group.pendingPayouts} pending payouts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </motion.div>
  );
};
