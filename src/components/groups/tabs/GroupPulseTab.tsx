
import React from 'react';
import { GroupPulse } from '@/components/group-pulse/GroupPulse';

interface GroupPulseTabProps {
  groupId: string;
}

export const GroupPulseTab = ({ groupId }: GroupPulseTabProps) => {
  return <GroupPulse groupId={groupId} />;
};
