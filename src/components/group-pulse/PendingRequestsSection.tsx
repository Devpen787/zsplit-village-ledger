
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PotActivity } from '@/types/group-pot';
import { PendingPayoutRequestsList } from './PendingPayoutRequestsList';

interface PendingRequestsSectionProps {
  pendingRequests: PotActivity[];
  onApprove: (activityId: string) => Promise<void>;
  onReject: (activityId: string) => Promise<void>;
  isAdmin: boolean;
}

export const PendingRequestsSection = ({
  pendingRequests,
  onApprove,
  onReject,
  isAdmin
}: PendingRequestsSectionProps) => {
  if (!pendingRequests || pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payout Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <PendingPayoutRequestsList
          pendingRequests={pendingRequests}
          onApprove={onApprove}
          onReject={onReject}
          isAdmin={isAdmin}
        />
      </CardContent>
    </Card>
  );
};
