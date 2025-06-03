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
import { Loader2, AlertTriangle, ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupOverview } from "@/components/groups/GroupOverview";
import { ExpensesList } from "@/components/ExpensesList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ImprovedInviteMemberDialog } from "@/components/groups/ImprovedInviteMemberDialog";

const GroupView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { 
    group, 
    members, 
    loading, 
    isAdmin, 
    inviteMember,
    refreshData,
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
      // Refresh data after successful invitation
      await refreshData();
    } catch (error: any) {
      console.error("Error in invitation flow:", error);
    }
  };

  const handleMemberAdded = async () => {
    console.log("[GROUP VIEW] Member added, refreshing data");
    await refreshData();
  };
  
  // If no group ID is provided, redirect to the groups list
  useEffect(() => {
    if (!id) {
      navigate('/group');
    }
  }, [id, navigate]);

  // Animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading group details...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!group) {
    return (
      <AppLayout>
        <motion.div 
          className="container mx-auto py-6 space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-destructive/20 shadow">
            <CardHeader>
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Group not found</CardTitle>
              </div>
              <CardDescription>
                The group you're looking for doesn't exist or you don't have access to it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/group')} className="mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Groups
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        className="container mx-auto py-6 space-y-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
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
              onMemberUpdate={handleMemberAdded}
            />

            {/* Group Expenses List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Card className="shadow-sm hover:shadow transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Group Expenses</CardTitle>
                    <CardDescription>Recent expenses for this group</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleCreateExpense} 
                    className="hidden md:flex"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </CardHeader>
                <CardContent>
                  <ExpensesList groupId={id} />
                </CardContent>
              </Card>
            </motion.div>
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
            onMemberUpdate={handleMemberAdded}
          />
        )}
        
        <ImprovedInviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          groupId={id!}
          invitedBy={user?.id || ''}
          onMemberAdded={handleMemberAdded}
        />
      </motion.div>
    </AppLayout>
  );
};

export default GroupView;
