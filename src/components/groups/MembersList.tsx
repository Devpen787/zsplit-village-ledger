
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { GroupMember } from '@/types/supabase';

interface MembersListProps {
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
  displayStyle?: 'compact' | 'grid';
}

export const MembersList = ({ 
  members, 
  isAdmin, 
  onInviteClick, 
  currentUserId,
  displayStyle = 'compact'
}: MembersListProps) => {
  if (displayStyle === 'compact') {
    return (
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {members.map((member) => (
          <div key={member.id} className="flex-shrink-0">
            <Avatar className="border-2 border-background">
              <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
              <AvatarFallback>
                {member.user?.name?.charAt(0) || member.user?.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
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
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
              <AvatarFallback>
                {member.user?.name?.charAt(0) || member.user?.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {member.user?.name || 'Unknown User'}
                {currentUserId && member.user?.id === currentUserId && " (You)"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
              <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {member.role === 'admin' ? 'organizer' : 'participant'}
              </Badge>
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
