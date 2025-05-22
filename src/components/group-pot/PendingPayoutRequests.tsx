
import React from 'react';
import { PotActivity } from '@/types/group-pot';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface PendingPayoutRequestsProps {
  activities: PotActivity[];
  onApprove: (activityId: string) => Promise<void>;
  onReject: (activityId: string) => Promise<void>;
}

export const PendingPayoutRequests = ({ 
  activities, 
  onApprove, 
  onReject 
}: PendingPayoutRequestsProps) => {
  // Filter only pending payout requests
  const pendingRequests = activities.filter(
    activity => activity.type === 'payout' && activity.status === 'pending'
  );

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No pending requests
          </p>
        </CardContent>
      </Card>
    );
  }

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
              className="flex items-start justify-between p-4 rounded-lg border border-border"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {request.users?.name || request.users?.email || 'Unknown user'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.created_at && formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </p>
                <p className="font-medium">{request.amount.toFixed(2)} CHF</p>
                {request.note && <p className="text-sm mt-1">{request.note}</p>}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onReject(request.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onApprove(request.id)}
                  className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
