
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { GroupHeader } from "@/components/groups/GroupHeader";
import { MembersCard } from "@/components/groups/MembersCard";
import { GroupTabs } from "@/components/groups/GroupTabs";
import { InviteMemberDialog } from "@/components/groups/InviteMemberDialog";
import { useGroupDetails } from "@/hooks/useGroupDetails";
import { useAuth } from "@/contexts";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GroupOverview } from "@/components/groups/GroupOverview";
import { ExpensesList } from "@/components/ExpensesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GroupView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // Set "overview" as the default tab
  
  const { 
    group, 
    members, 
    loading, 
    isAdmin, 
    inviteMember,
    potBalance = 0,
    totalExpenses = 0,
    pendingPayoutsCount = 0,
    connectedWalletsCount = 0
  } = useGroupDetails(id, user);
  
  const handleCreateExpense = () => {
    navigate(`/expenses/new?groupId=${id}`);
  };
  
  const handleInviteMember = async (email: string) => {
    try {
      await inviteMember(email);
    } catch (error: any) {
      // Error is already handled in useGroupDetails
      console.error("Error in invitation flow:", error);
    }
  };
  
  // If no group ID is provided, redirect to the groups list
  useEffect(() => {
    if (!id) {
      navigate('/group');
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  if (!group) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-semibold">Group not found</h1>
          <Button onClick={() => navigate('/group')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <GroupHeader 
          groupName={group.name}
          groupIcon={group.icon}
          isAdmin={isAdmin}
          onCreateExpense={handleCreateExpense}
        />

        {activeTab === "overview" ? (
          <>
            <GroupOverview
              groupId={id!}
              group={group}
              members={members}
              isAdmin={isAdmin}
              onInviteClick={() => setInviteDialogOpen(true)}
              currentUserId={user?.id}
              potBalance={potBalance}
              totalExpenses={totalExpenses}
              pendingPayoutsCount={pendingPayoutsCount}
              connectedWalletsCount={connectedWalletsCount}
            />

            {/* Group Expenses List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Group Expenses</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={handleCreateExpense} 
                  className="hidden md:flex"
                >
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                <ExpensesList groupId={id} />
              </CardContent>
            </Card>
          </>
        ) : (
          <GroupTabs
            groupId={id!}
            members={members}
            isAdmin={isAdmin}
            onInviteClick={() => setInviteDialogOpen(true)}
            currentUser={user}
            group={group}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
        
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onInvite={handleInviteMember}
        />
      </div>
    </AppLayout>
  );
};

export default GroupView;
