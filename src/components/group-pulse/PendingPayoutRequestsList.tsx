
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PotActivity } from '@/types/group-pot';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDemoPayoutRequests } from '@/utils/demoData';
import { UserInfoDisplay } from '@/components/shared/UserInfoDisplay';
import { RequestApprovalActions } from '@/components/shared/RequestApprovalActions';

interface PendingPayoutRequestsListProps {
  pendingRequests: PotActivity[];
  onApprove: (activityId: string) => Promise<void>;
  onReject: (activityId: string) => Promise<void>;
  isAdmin: boolean;
}

export const PendingPayoutRequestsList: React.FC<PendingPayoutRequestsListProps> = ({ 
  pendingRequests,
  onApprove,
  onReject,
  isAdmin
}) => {
  // Add demo data if needed
  const requests = getDemoPayoutRequests(pendingRequests);

  if (requests.length === 0) {
    return <p className="text-muted-foreground text-sm">No pending requests</p>;
  }

  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Requester</TableHead>
            <TableHead>Amount (CHF)</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <UserInfoDisplay 
                  user={{
                    name: request.users?.name,
                    email: request.users?.email,
                    wallet_address: request.users?.wallet_address
                  }}
                />
              </TableCell>
              <TableCell>{request.amount.toFixed(2)}</TableCell>
              <TableCell>{request.note || '-'}</TableCell>
              <TableCell>
                {request.created_at 
                  ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true }) 
                  : 'Unknown'}
              </TableCell>
              <TableCell>
                <RequestApprovalActions
                  requestUserId={request.user_id}
                  isAdmin={isAdmin}
                  onApprove={() => onApprove(request.id)}
                  onReject={() => onReject(request.id)}
                  size="sm"
                  className="justify-start"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
