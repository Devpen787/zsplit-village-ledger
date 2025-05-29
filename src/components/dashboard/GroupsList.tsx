
import React, { useState } from 'react';
import { Group } from '@/types/supabase';
import { GroupDeleteDialog } from '@/components/groups/GroupDeleteDialog';
import { useGroupDeletion } from '@/hooks/useGroupDeletion';
import { useAuth } from '@/contexts';
import { GroupsListSkeleton } from './groups-list/GroupsListSkeleton';
import { GroupsListError } from './groups-list/GroupsListError';
import { GroupsListEmpty } from './groups-list/GroupsListEmpty';
import { GroupCard } from './groups-list/GroupCard';
import { CreateGroupCard } from './groups-list/CreateGroupCard';

export interface GroupsListProps {
  groups: Group[];
  loading: boolean;
  error: string | null;
  hasRecursionError?: boolean;
  onCreateGroup: () => void;
  onRefresh: () => Promise<void>;
  onGroupSelect?: (groupId: string) => void;
}

export const GroupsList = ({ 
  groups, 
  loading, 
  error, 
  hasRecursionError = false, 
  onCreateGroup,
  onRefresh,
  onGroupSelect
}: GroupsListProps) => {
  const { user } = useAuth();
  const { deleteGroup, loading: deleteLoading } = useGroupDeletion();
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (group: Group, event: React.MouseEvent) => {
    event.stopPropagation();
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;
    
    const success = await deleteGroup(groupToDelete.id);
    if (success) {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      onRefresh();
    }
  };

  const canDeleteGroup = (group: Group) => {
    return user && group.created_by === user.id;
  };

  if (loading) {
    return <GroupsListSkeleton />;
  }
  
  if (hasRecursionError || error) {
    return (
      <GroupsListError 
        error={error || ''} 
        hasRecursionError={hasRecursionError}
        onRefresh={onRefresh}
      />
    );
  }
  
  if (groups.length === 0) {
    return <GroupsListEmpty onCreateGroup={onCreateGroup} />;
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            canDelete={canDeleteGroup(group)}
            onSelect={onGroupSelect || (() => {})}
            onDeleteClick={handleDeleteClick}
          />
        ))}
        <CreateGroupCard onCreateGroup={onCreateGroup} />
      </div>

      <GroupDeleteDialog
        group={groupToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </>
  );
};
