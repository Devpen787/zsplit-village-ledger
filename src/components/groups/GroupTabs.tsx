
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExpensesList } from "@/components/ExpensesList";
import { UserPlus } from "lucide-react";
import { GroupMember } from '@/types/supabase';

interface GroupTabsProps {
  groupId: string;
  members: GroupMember[];
  isAdmin: boolean;
  onInviteClick: () => void;
  currentUser?: {
    id: string;
  } | null;
}

export const GroupTabs = ({ 
  groupId, 
  members, 
  isAdmin, 
  onInviteClick, 
  currentUser 
}: GroupTabsProps) => {
  return (
    <Tabs defaultValue="expenses" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
      </TabsList>
      <TabsContent value="expenses" className="mt-4">
        <ExpensesList groupId={groupId} />
      </TabsContent>
      <TabsContent value="members" className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Group Members</CardTitle>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onInviteClick}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {members.length > 0 ? (
              members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${member.user?.email}`} />
                      <AvatarFallback>
                        {member.user?.name?.charAt(0) || member.user?.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.user?.name || member.user?.email.split('@')[0]}
                        {currentUser && member.user?.id === currentUser.id && " (You)"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No members found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="balances" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Balance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4 text-muted-foreground">
              Balance visualization will be available soon
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
