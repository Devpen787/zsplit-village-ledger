
import React, { useState } from 'react';
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
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { PlusIcon, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { groups, loading, error, hasRecursionError, fetchGroups } = useGroupsList();

  const handleCreateGroup = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setIsCreateGroupModalOpen(false);
    toast.success(`Group "${newGroup.name}" created successfully!`);
    fetchGroups();
    
    // Navigate to the new group's overview page
    navigate(`/group/${newGroup.id}`);
  };
  
  // This handler is correctly configured to navigate to the specific group view
  const handleGroupSelect = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };
  
  const handleNewExpense = () => {
    navigate('/expenses/new');
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

  if (loading) {
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
              loading={loading}
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
