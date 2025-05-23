
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PotActivity } from '@/types/group-pot';
import { Button } from '@/components/ui/button';
import { Check, X, Wallet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  // If no real requests exist, add demo entries
  let requests = pendingRequests;
  
  if (requests.length === 0) {
    // Demo data for testing purposes
    const demoRequests: PotActivity[] = [
      {
        id: 'demo-request-1',
        group_id: '',
        user_id: 'demo-user-1',
        type: 'payout',
        amount: 75.50,
        status: 'pending',
        note: 'Pizza for group meeting',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        users: {
          name: 'Alex Johnson',
          email: 'alex@example.com',
          wallet_address: '0x1234...5678'
        }
      },
      {
        id: 'demo-request-2',
        group_id: '',
        user_id: 'demo-user-2',
        type: 'payout',
        amount: 120.00,
        status: 'pending',
        note: 'Transportation expenses',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        users: {
          name: 'Sam Wilson',
          email: 'sam@example.com',
          wallet_address: null
        }
      }
    ];
    
    requests = demoRequests;
  }
  
  // Helper to shorten wallet addresses
  const shortenAddress = (address: string | null | undefined) => {
    if (!address) return null;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

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
                <div>
                  <div>{request.users?.name || request.users?.email || 'Unknown user'}</div>
                  {request.users?.wallet_address && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Wallet className="h-3 w-3 mr-1" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-default">
                            <span>
                              {shortenAddress(request.users.wallet_address)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Request will be reimbursed to this wallet</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  {!request.users?.wallet_address && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      No wallet connected
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{request.amount.toFixed(2)}</TableCell>
              <TableCell>{request.note || '-'}</TableCell>
              <TableCell>
                {request.created_at 
                  ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true }) 
                  : 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1 text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                    onClick={() => onApprove(request.id)}
                  >
                    <Check size={16} />
                    Approve
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onReject(request.id)}
                  >
                    <X size={16} />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
