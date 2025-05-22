
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { MembersList } from "@/components/groups/MembersList";
import { GroupMember } from '@/types/supabase';

interface MembersCardProps {
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
}

export const MembersCard = ({ members, isAdmin, onInviteClick, currentUserId }: MembersCardProps) => {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-sm font-medium mr-3">Group Members</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onInviteClick}
              className="text-xs"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Invite
            </Button>
          )}
        </div>
        <div className="mt-3">
          <MembersList 
            members={members}
            isAdmin={isAdmin}
            onInviteClick={onInviteClick}
            currentUserId={currentUserId}
          />
        </div>
      </CardContent>
    </Card>
  );
};
