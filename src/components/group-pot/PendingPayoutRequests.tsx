
import React from 'react';
import { PotActivity } from '@/types/group-pot';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { getDemoPayoutRequests } from '@/utils/demoData';
import { UserInfoDisplay } from '@/components/shared/UserInfoDisplay';
import { RequestApprovalActions } from '@/components/shared/RequestApprovalActions';

interface PendingPayoutRequestsProps {
  activities: PotActivity[];
  onApprove: (activityId: string) => Promise<void>;
  onReject: (activityId: string) => Promise<void>;
  isAdmin: boolean; 
}

export const PendingPayoutRequests = ({ 
  activities, 
  onApprove, 
  onReject,
  isAdmin
}: PendingPayoutRequestsProps) => {
  // Filter only pending payout requests and add demo data if needed
  const pendingRequests = getDemoPayoutRequests(
    activities.filter(activity => activity.type === 'payout' && activity.status === 'pending')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payout Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div 
              key={request.id}
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 rounded-lg border border-border"
            >
              <div className="space-y-1 mb-4 sm:mb-0">
                <UserInfoDisplay 
                  user={{
                    name: request.users?.name,
                    email: request.users?.email,
                    wallet_address: request.users?.wallet_address
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  {request.created_at && formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </p>
                <p className="font-medium">{request.amount.toFixed(2)} CHF</p>
                {request.note && <p className="text-sm mt-1">{request.note}</p>}
              </div>
              
              <RequestApprovalActions
                requestUserId={request.user_id}
                isAdmin={isAdmin}
                onApprove={() => onApprove(request.id)}
                onReject={() => onReject(request.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
