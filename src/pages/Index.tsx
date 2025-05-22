
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
import { PlusIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  const handleGroupSelect = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };
  
  const handleNewExpense = () => {
    navigate('/expenses/new');
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <DashboardHeader onCreateGroup={handleCreateGroup} />

        {user && (
          <>
            <DashboardSummary />
            <UserWelcomeCard user={user} />
          </>
        )}

        <DashboardSection title="Your Groups" linkText="View All" linkTo="/group">
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

        <DashboardSection 
          title="Recent Expenses" 
          linkText={isMobile ? undefined : "New Expense"} 
          linkTo={isMobile ? undefined : "/expenses/new"}
        >
          <ExpensesList limit={5} />
        </DashboardSection>
      </div>

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
