
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ExpensesList } from "@/components/ExpensesList";
import { MembersList } from "@/components/groups/MembersList";
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
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MembersList
              members={members}
              isAdmin={isAdmin}
              onInviteClick={onInviteClick}
              currentUserId={currentUser?.id}
              displayStyle="grid"
            />
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
