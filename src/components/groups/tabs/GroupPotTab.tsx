
import React from 'react';
import { GroupPot } from '@/components/group-pot/GroupPot';

interface GroupPotTabProps {
  groupId: string;
}

export const GroupPotTab = ({ groupId }: GroupPotTabProps) => {
  return <GroupPot groupId={groupId} />;
};
