
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Crown, User, Loader2 } from 'lucide-react';
import type { SimpleGroupMember } from '@/hooks/useSimpleGroupMembers';

interface SimpleMembersCardProps {
  members: SimpleGroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
  loading?: boolean;
}

export const SimpleMembersCard = ({ 
  members, 
  isAdmin, 
  onInviteClick, 
  currentUserId,
  loading = false 
}: SimpleMembersCardProps) => {
  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Crown className="h-3 w-3 text-yellow-500" />;
    return <User className="h-3 w-3 text-gray-500" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'organizer';
    return role;
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default' as const;
    return 'secondary' as const;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members ({members.length})
        </CardTitle>
        {isAdmin && (
          <Button onClick={onInviteClick} size="sm" variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No members yet</p>
            {isAdmin && (
              <Button 
                onClick={onInviteClick} 
                variant="outline" 
                className="mt-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite the first member
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
                    <AvatarFallback>
                      {member.user?.name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {member.role === 'admin' && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                      <Crown className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {member.user?.name || 'Unknown User'}
                      {currentUserId === member.user?.id && ' (You)'}
                    </p>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <Badge 
                        variant={getRoleBadgeVariant(member.role)} 
                        className="text-xs"
                      >
                        {getRoleLabel(member.role)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.user?.email || 'No email'}
                  </p>
                  {member.user?.wallet_address && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Wallet connected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
