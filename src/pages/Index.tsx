
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

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { groups, loading, error, hasRecursionError, fetchGroups } = useGroupsList();

  const handleCreateGroup = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleGroupCreated = (newGroup: Group) => {
    setIsCreateGroupModalOpen(false);
    toast.success(`Group "${newGroup.name}" created successfully!`);
    fetchGroups();
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <DashboardHeader onCreateGroup={handleCreateGroup} />

        {user && <UserWelcomeCard user={user} />}

        <DashboardSection title="Your Groups" linkText="View All" linkTo="/group">
          <GroupsList
            groups={groups}
            loading={loading}
            error={error}
            hasRecursionError={hasRecursionError}
            onCreateGroup={handleCreateGroup}
            onRefresh={fetchGroups}
          />
        </DashboardSection>

        <DashboardSection title="Recent Expenses" linkText="New Expense" linkTo="/expenses/new">
          <ExpensesList limit={5} />
        </DashboardSection>
      </div>

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
