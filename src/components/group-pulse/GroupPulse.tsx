
import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useGroupPulse } from '@/hooks/useGroupPulse';
import { IntroCard } from './IntroCard';
import { PotBalanceCard } from './PotBalanceCard';
import { ExpensesStatusCard } from './ExpensesStatusCard';
import { PotHealthCard } from './PotHealthCard';
import { RecentActivityCard } from './RecentActivityCard';
import { GroupConnectivityCard } from './GroupConnectivityCard';
import { PayoutRequestsCard } from './PayoutRequestsCard';
import { PendingRequestsSection } from './PendingRequestsSection';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartPie, AlertTriangle } from 'lucide-react';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const GroupPulse = ({ groupId }: { groupId: string }) => {
  const { isConnected } = useWallet();
  const { group, loading: loadingGroup } = useGroupDetails(groupId);
  const [activeTab, setActiveTab] = useState<"group" | "all">("group");
  const {
    loading,
    potBalance,
    averagePayoutSize,
    estimatedPayoutsRemaining,
    recentExpensesCount,
    latestExpenseDate,
    pendingPayoutsCount,
    averageApprovalTime,
    pendingRequests,
    connectedWalletsCount,
    totalMembersCount,
    handleApproveRequest,
    handleRejectRequest,
    isAdmin,
    // Cross-group statistics
    allGroupsStats
  } = useGroupPulse(groupId);

  // Animation variants for staggered card appearance
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="grid gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Group Info Header */}
      <motion.div variants={item}>
        <Card className="shadow-sm hover:shadow transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <ChartPie className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Group Pulse{group?.name ? ` - ${group.name}` : ''}</CardTitle>
                <CardDescription>Analytics and financial insights</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "group" | "all")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="group">Current Group</TabsTrigger>
                <TabsTrigger value="all">All Groups</TabsTrigger>
              </TabsList>
              
              <TabsContent value="group" className="pt-4">
                <p className="text-muted-foreground">
                  View analytics and insights for this specific group. Monitor pot balance, expenses, and member activity.
                </p>
              </TabsContent>
              
              <TabsContent value="all" className="pt-4">
                <p className="text-muted-foreground">
                  View cross-group analytics and insights. Compare financial health and activity across all your groups.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {activeTab === "group" ? (
        <>
          {/* Financial metrics shown to all users regardless of wallet connection */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={item}>
              <PotBalanceCard potBalance={potBalance} />
            </motion.div>
            <motion.div variants={item}>
              <ExpensesStatusCard potBalance={potBalance} loading={loading} />
            </motion.div>
          </div>
          
          {/* Pot Health and Activity metrics */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={item}>
              <PotHealthCard 
                averagePayoutSize={averagePayoutSize} 
                estimatedPayoutsRemaining={estimatedPayoutsRemaining} 
              />
            </motion.div>
            <motion.div variants={item}>
              <RecentActivityCard 
                recentExpensesCount={recentExpensesCount} 
                latestExpenseDate={latestExpenseDate} 
              />
            </motion.div>
          </div>
          
          {/* Group connectivity status */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={item}>
              <GroupConnectivityCard 
                connectedWalletsCount={connectedWalletsCount} 
                totalMembersCount={totalMembersCount} 
              />
            </motion.div>
            <motion.div variants={item}>
              <PayoutRequestsCard 
                pendingPayoutsCount={pendingPayoutsCount} 
                averageApprovalTime={averageApprovalTime} 
              />
            </motion.div>
          </div>

          {/* Pending payout requests list - shown to all but actions only for admins */}
          <motion.div variants={item} className="grid gap-6">
            <PendingRequestsSection 
              pendingRequests={pendingRequests} 
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              isAdmin={isAdmin && isConnected}
            />
          </motion.div>
        </>
      ) : (
        // Cross-group statistics view
        <motion.div variants={item} className="grid gap-6">
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
      )}
    </motion.div>
  );
};
