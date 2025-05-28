
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MembersList } from "./MembersList";
import { Badge } from "@/components/ui/badge";
import { GroupMember } from '@/types/supabase';
import { CreditCard, AlertCircle, Wallet, Users, Calendar, ChevronRight, Settings } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GroupManagementPanel } from './GroupManagementPanel';

interface GroupOverviewProps {
  groupId: string;
  group: {
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
  onMemberUpdate?: () => void;
}

export const GroupOverview: React.FC<GroupOverviewProps> = ({
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
}) => {
  const navigate = useNavigate();
  
  if (!group) return null;

  // Animation variants
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
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Group Overview Header with detailed information */}
      <motion.div variants={item}>
        <Card className="shadow-sm hover:shadow transition-all duration-300">
          <CardHeader>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <div className="text-4xl p-3 bg-primary/10 rounded-xl mr-5">{group.icon}</div>
                <div>
                  <CardTitle className="text-2xl">{group.name}</CardTitle>
                  <div className="flex flex-wrap items-center mt-1 text-sm text-muted-foreground space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}</span>
                    <span>•</span>
                    <Users className="h-3 w-3" />
                    <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Group Metrics Section */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="shadow-sm hover:shadow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="flex items-center text-muted-foreground mb-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Total Expenses</span>
                </div>
                <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} CHF</div>
                <div className="mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary" 
                    onClick={() => navigate(`/expenses/new?groupId=${groupId}`)}
                  >
                    Add Expense
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="flex items-center text-muted-foreground mb-2">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Pot Balance</span>
                </div>
                <div className="text-2xl font-bold">{potBalance.toFixed(2)} CHF</div>
                <div className="mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary"
                    onClick={() => navigate(`/group-pot/${groupId}`)}
                  >
                    View Pot
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="flex items-center text-muted-foreground mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Pending Payouts</span>
                </div>
                <div className="text-2xl font-bold">{pendingPayoutsCount}</div>
                <div className="mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary"
                    onClick={() => navigate(`/group-pulse/${groupId}`)}
                  >
                    View Details
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="flex items-center text-muted-foreground mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Connected Wallets</span>
                </div>
                <div className="text-2xl font-bold">
                  {connectedWalletsCount} of {members.length}
                </div>
                <div className="mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-primary"
                    onClick={onInviteClick}
                  >
                    Invite Members
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Members Section with roles and wallet indicators */}
      <motion.div variants={item}>
        <Card className="shadow-sm hover:shadow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>People with access to this group</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-primary/5">
                <Users className="h-3 w-3 mr-1" />
                {members.filter(m => m.role === 'admin').length} Organizers
              </Badge>
              <Badge variant="outline" className="bg-primary/5">
                <Users className="h-3 w-3 mr-1" />
                {members.filter(m => m.role === 'member' || m.role === 'participant').length} Participants
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <MembersList
              members={members}
              isAdmin={isAdmin}
              onInviteClick={onInviteClick}
              currentUserId={currentUserId}
              displayStyle="grid"
              showWalletIndicator={true}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Group Management Panel - Only visible to admins */}
      {isAdmin && onMemberUpdate && (
        <motion.div variants={item}>
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
