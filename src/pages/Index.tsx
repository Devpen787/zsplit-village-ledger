import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from '@/contexts';
import { toast } from "@/components/ui/sonner";
import { GroupCreationModal } from '@/components/groups/GroupCreationModal';
import { Group } from '@/types/supabase';
import { ExpensesList } from "@/components/ExpensesList";
import { useGroupsList } from '@/hooks/useGroupsList';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UserWelcomeCard } from '@/components/dashboard/UserWelcomeCard';
import { GroupsList } from '@/components/dashboard/GroupsList';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { InvitationsPanel } from '@/components/groups/InvitationsPanel';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { PlusIcon, Loader2, AlertCircle, LogOutIcon, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";

const LOADING_TIMEOUT_MS = 20000;

const Index = () => {
  const { user, loading: authLoading, authError, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { groups, loading: groupsLoading, error, hasRecursionError, fetchGroups } = useGroupsList();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Loading stuck state: Timeout after 20s
  useEffect(() => {
    if (authLoading || groupsLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, LOADING_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
    setLoadingTimeout(false);
  }, [authLoading, groupsLoading]);

  const handleCreateGroup = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setIsCreateGroupModalOpen(false);
    toast.success(`Group "${newGroup.name}" created successfully!`);
    fetchGroups();
    navigate(`/group/${newGroup.id}`);
  };

  const handleGroupSelect = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  const handleNewExpense = () => {
    navigate('/expenses/new');
  };

  const handleRetry = async () => {
    setLoadingTimeout(false);
    await refreshUser();
    fetchGroups();
  };

  const handleForceSignOut = async () => {
    setLoadingTimeout(false);
    await signOut();
    navigate("/login");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Robust fail for stuck loading
  if ((authLoading || groupsLoading) && !loadingTimeout) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (loadingTimeout || authError || error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center mt-20 gap-6 max-w-lg mx-auto">
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-5 w-5 mr-2" />
            <AlertDescription>
              {authError
                ? <>Authentication failed: {authError}</>
                : error
                  ? <>Error loading dashboard: {error}</>
                  : <>Dashboard took too long to load. This may be an authentication issue, a slow network, or a temporary bug.<br />Try one of the actions below.</>
              }
            </AlertDescription>
          </Alert>
          <div className="w-full flex flex-col gap-2">
            <Button onClick={handleRetry} variant="default" className="w-full gap-2" >
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
            <Button onClick={handleForceSignOut} variant="outline" className="w-full gap-2">
              <LogOutIcon className="w-4 h-4" /> Sign Out
            </Button>
            <Button onClick={() => navigate("/login")} variant="ghost" className="w-full gap-2">
              <AlertCircle className="w-4 h-4" /> Return to Login
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center mt-3 px-2">
            If this issue persists, please try clearing your browser cache and reloading the page.<br />If you think this is a bug, check the console or <a href="https://docs.lovable.dev/tips-tricks/troubleshooting" className="underline" target="_blank" rel="noopener noreferrer">see troubleshooting</a>.
          </div>
        </div>
      </AppLayout>
    );
  }

  useEffect(() => {
    console.log('[DASHBOARD] authLoading:', authLoading, 'groupsLoading:', groupsLoading, 'user:', user);
  }, [authLoading, groupsLoading, user]);

  return (
    <AppLayout>
      <motion.div
        className="container mx-auto py-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <DashboardHeader onCreateGroup={handleCreateGroup} />
        </motion.div>

        {user && (
          <>
            <motion.div variants={itemVariants}>
              <DashboardSummary />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <UserWelcomeCard user={user} />
            </motion.div>

            {/* Group Invitations Panel */}
            <motion.div variants={itemVariants}>
              <InvitationsPanel />
            </motion.div>
          </>
        )}

        <motion.div variants={itemVariants}>
          <DashboardSection 
            title="Your Groups" 
            linkText="View All" 
            linkTo="/group"
            description="Groups you are part of"
          >
            <GroupsList
              groups={groups}
              loading={groupsLoading}
              error={error}
              hasRecursionError={hasRecursionError}
              onCreateGroup={handleCreateGroup}
              onRefresh={fetchGroups}
              onGroupSelect={handleGroupSelect} 
            />
          </DashboardSection>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DashboardSection 
            title="Recent Expenses" 
            linkText={isMobile ? undefined : "New Expense"} 
            linkTo={isMobile ? undefined : "/expenses/new"}
            description="Your most recent expenses"
          >
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <ExpensesList limit={5} />
              </CardContent>
            </Card>
          </DashboardSection>
        </motion.div>
      </motion.div>

      {/* Floating Action Button for new expense (especially useful on mobile) */}
      <FloatingActionButton
        onClick={handleNewExpense}
        position={isMobile ? "bottom-center" : "bottom-right"}
        aria-label="Create new expense"
        className={isMobile ? "mb-16" : ""} // Add margin to avoid overlap with mobile nav
      >
        <PlusIcon className="h-6 w-6" />
      </FloatingActionButton>

      <GroupCreationModal 
        open={isCreateGroupModalOpen}
        onOpenChange={setIsCreateGroupModalOpen}
        onGroupCreated={handleGroupCreated}
        groups={groups}
      />
    </AppLayout>
  );
};

export default Index;
