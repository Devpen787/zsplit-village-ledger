
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { GroupMember } from '@/types/supabase';

interface MembersListProps {
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
}

export const MembersList = ({ members, isAdmin, onInviteClick, currentUserId }: MembersListProps) => {
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
};
