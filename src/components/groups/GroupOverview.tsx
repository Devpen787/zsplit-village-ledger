
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MembersList } from "./MembersList";
import { Badge } from "@/components/ui/badge";
import { GroupMember } from '@/types/supabase';
import { CreditCard, AlertCircle, Wallet, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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
  connectedWalletsCount = 0
}) => {
  if (!group) return null;

  return (
    <div className="space-y-6">
      {/* Group Overview Header with detailed information */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <div className="text-3xl mr-3">{group.icon}</div>
              <div>
                <CardTitle className="text-2xl">{group.name}</CardTitle>
                <div className="flex items-center mt-1 text-sm text-muted-foreground space-x-2">
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

      {/* Group Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center text-muted-foreground mb-2">
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="text-sm">Total Expenses</span>
              </div>
              <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} CHF</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center text-muted-foreground mb-2">
                <Wallet className="h-4 w-4 mr-2" />
                <span className="text-sm">Pot Balance</span>
              </div>
              <div className="text-2xl font-bold">{potBalance.toFixed(2)} CHF</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center text-muted-foreground mb-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Pending Payouts</span>
              </div>
              <div className="text-2xl font-bold">{pendingPayoutsCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center text-muted-foreground mb-2">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">Connected Wallets</span>
              </div>
              <div className="text-2xl font-bold">
                {connectedWalletsCount} of {members.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section with roles and wallet indicators */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="outline">{members.filter(m => m.role === 'admin').length} Organizers</Badge>
            <Badge variant="outline">{members.filter(m => m.role === 'member').length} Participants</Badge>
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
    </div>
  );
};
