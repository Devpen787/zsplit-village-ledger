
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [expanded, setExpanded] = useState(true);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  console.log("MembersCard - members:", members, "loading:", loading, "isAdmin:", isAdmin);
  
  return (
    <Card className="shadow-sm border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-lg">Group Members</CardTitle>
            <span className="ml-3 text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {loading ? 'Loading...' : `${members.length} ${members.length === 1 ? 'member' : 'members'}`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button 
                onClick={onInviteClick}
                size="sm"
                className="flex items-center bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-sm text-muted-foreground py-4">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <div className="text-lg font-medium mb-2">No members yet</div>
              <div className="text-sm text-muted-foreground mb-4">
                Start by inviting people to join this group
              </div>
              {isAdmin && (
                <Button 
                  onClick={onInviteClick}
                  className="flex items-center mx-auto bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
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
              displayStyle="grid"
              showWalletIndicator={true}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
};
