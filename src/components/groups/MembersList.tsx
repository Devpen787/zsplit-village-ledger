
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Wallet, Crown, User } from "lucide-react";
import { GroupMember } from '@/types/supabase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MembersListProps {
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
  displayStyle?: 'compact' | 'grid';
  showWalletIndicator?: boolean;
}

export const MembersList = ({ 
  members, 
  isAdmin, 
  onInviteClick, 
  currentUserId,
  displayStyle = 'compact',
  showWalletIndicator = false
}: MembersListProps) => {
  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Crown className="h-3 w-3 text-yellow-500" />;
    return <User className="h-3 w-3 text-gray-500" />;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return 'organizer';
    return role;
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default';
    return 'secondary';
  };

  if (displayStyle === 'compact') {
    return (
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {members.map((member) => (
          <TooltipProvider key={member.id}>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex-shrink-0 relative">
                  <Avatar className="border-2 border-background">
                    <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
                    <AvatarFallback>
                      {member.user?.name?.charAt(0) || member.user?.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {member.role === 'admin' && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                      <Crown className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                  <Badge size="sm" variant={getRoleBadgeVariant(member.role)} className="mt-1">
                    {getRoleLabel(member.role)}
                  </Badge>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {isAdmin && (
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full ml-2 flex-shrink-0"
            onClick={onInviteClick}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <Card key={member.id} className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
                <AvatarFallback>
                  {member.user?.name?.charAt(0) || member.user?.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {member.role === 'admin' && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  {member.user?.name || 'Unknown User'}
                  {currentUserId && member.user?.id === currentUserId && " (You)"}
                </p>
                
                {showWalletIndicator && member.user && 
                  member.user.wallet_address && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Wallet className="h-3 w-3 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Has connected wallet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
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
          </div>
        </Card>
      ))}
      
      {isAdmin && (
        <Card className="p-4 flex items-center justify-center border-dashed">
          <Button 
            variant="ghost" 
            onClick={onInviteClick}
            className="h-full w-full flex flex-col items-center justify-center py-5"
          >
            <UserPlus className="h-8 w-8 mb-2" />
            <span>Invite Member</span>
          </Button>
        </Card>
      )}
    </div>
  );
};
