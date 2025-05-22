
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { MembersList } from "@/components/groups/MembersList";
import { GroupMember } from '@/types/supabase';

interface MembersCardProps {
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
}

export const MembersCard = ({ members, isAdmin, onInviteClick, currentUserId }: MembersCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
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
          <div className="flex items-center space-x-2">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="text-xs"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-3">
          <MembersList 
            members={members}
            isAdmin={isAdmin}
            onInviteClick={onInviteClick}
            currentUserId={currentUserId}
            displayStyle={expanded ? 'grid' : 'compact'}
          />
        </div>
      </CardContent>
    </Card>
  );
};
