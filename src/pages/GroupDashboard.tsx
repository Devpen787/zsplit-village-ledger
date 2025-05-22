import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { useGroupsList } from '@/hooks/useGroupsList';
import { GroupsList } from '@/components/dashboard/GroupsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { GroupCreationModal } from '@/components/groups/GroupCreationModal';
import { Group } from '@/types/supabase';
import { toast } from '@/components/ui/sonner';

const GroupDashboard = () => {
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
    
    // Navigate to the new group's details page
    navigate(`/group/${newGroup.id}`);
  };
  
  // This function ensures proper navigation to individual group pages
  const handleGroupSelect = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Your Groups</h1>
          <Button onClick={handleCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupsList
              groups={groups}
              loading={loading}
              error={error}
              hasRecursionError={hasRecursionError}
              onCreateGroup={handleCreateGroup}
              onRefresh={fetchGroups}
              onGroupSelect={handleGroupSelect}
            />
          </CardContent>
        </Card>

        <GroupCreationModal
          open={isCreateGroupModalOpen}
          onOpenChange={setIsCreateGroupModalOpen}
          onGroupCreated={handleGroupCreated}
          groups={groups}
        />
      </div>
    </AppLayout>
  );
};

export default GroupDashboard;
