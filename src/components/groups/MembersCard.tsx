
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, UserPlus, Users } from "lucide-react";
import { MembersList } from "@/components/groups/MembersList";
import { GroupMember } from '@/types/supabase';

interface MembersCardProps {
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUserId?: string;
  loading?: boolean;
}

export const MembersCard = ({ members, isAdmin, onInviteClick, currentUserId, loading = false }: MembersCardProps) => {
  const [expanded, setExpanded] = useState(true); // Default to expanded so users can see members
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <h3 className="text-sm font-medium mr-3">Group Members</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {loading ? 'Loading...' : `${members.length} ${members.length === 1 ? 'member' : 'members'}`}
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
        
        {expanded && (
          <div className="mt-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground mb-2">No members yet</div>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onInviteClick}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Invite First Member
                  </Button>
                )}
              </div>
            ) : (
              <MembersList 
                members={members}
                isAdmin={isAdmin}
                onInviteClick={onInviteClick}
                currentUserId={currentUserId}
                displayStyle={expanded ? 'grid' : 'compact'}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
