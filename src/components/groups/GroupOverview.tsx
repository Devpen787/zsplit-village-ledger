import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Wallet, PiggyBank, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { MembersCard } from "@/components/groups/MembersCard";
import { GroupManagementPanel } from "@/components/groups/GroupManagementPanel";
import { useAnimations } from '@/hooks/useAnimations';
import { motion } from "framer-motion";
import { formatCurrency } from '@/lib/utils';
import { GroupMember } from '@/types/supabase';

interface GroupOverviewProps {
  groupId: string;
  group?: {
    name: string;
    icon: string;
    created_at: string;
  } | null;
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
  potBalance?: number;
  totalExpenses?: number;
  pendingPayoutsCount?: number;
  connectedWalletsCount?: number;
  onMemberUpdate: () => void;
}

export const GroupOverview = ({
  groupId,
  group,
  members,
  isAdmin,
  onInviteClick,
  currentUserId,
  potBalance = 0,
  totalExpenses = 0,
  pendingPayoutsCount = 0,
  connectedWalletsCount = 0,
  onMemberUpdate
}: GroupOverviewProps) => {
  const { containerVariants, itemVariants } = useAnimations();

  return (
    <motion.div 
      className="grid gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Group Metrics */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/50">
          <CardContent className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Pot Balance */}
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-2 bg-green-100 text-green-600">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{formatCurrency(potBalance)}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Pot Balance</CardDescription>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-2 bg-blue-100 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{formatCurrency(totalExpenses)}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Total Expenses</CardDescription>
              </div>
            </div>

            {/* Pending Payouts */}
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-2 bg-yellow-100 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{pendingPayoutsCount}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Pending Payouts</CardDescription>
              </div>
            </div>

            {/* Connected Wallets */}
            <div className="flex items-center space-x-4">
              <div className="rounded-full p-2 bg-purple-100 text-purple-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{connectedWalletsCount}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Connected Wallets</CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Members Section */}
      <motion.div variants={itemVariants}>
        <MembersCard 
          members={members}
          isAdmin={isAdmin}
          onInviteClick={onInviteClick}
          currentUserId={currentUserId}
        />
      </motion.div>

      {/* Group Management Panel - Only show for admins */}
      {isAdmin && onMemberUpdate && (
        <motion.div variants={itemVariants}>
          <GroupManagementPanel
            groupId={groupId}
            members={members}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onMemberUpdate={onMemberUpdate}
          />
        </motion.div>
      )}
    </motion.div>
  );
};
