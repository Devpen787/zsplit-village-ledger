
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PotActivity } from '@/types/group-pot';
import { Button } from '@/components/ui/button';
import { Check, X, Wallet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';

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
  const { user } = useAuth();
  
  // If no real requests exist, add demo entries only in development
  let requests = pendingRequests;
  
  if (requests.length === 0 && process.env.NODE_ENV === 'development') {
    // Demo data for testing purposes - only in development
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

  // Security check for self-approval
  const handleApprove = async (request: PotActivity) => {
    if (request.user_id === user?.id) {
      toast.error("You cannot approve your own requests");
      return;
    }
    await onApprove(request.id);
  };

  const handleReject = async (request: PotActivity) => {
    if (request.user_id === user?.id) {
      toast.error("You cannot reject your own requests");
      return;
    }
    await onReject(request.id);
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
                {isAdmin && request.user_id !== user?.id ? (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1 text-green-500 border-green-200 hover:bg-green-50 hover:text-green-600"
                      onClick={() => handleApprove(request)}
                    >
                      <Check size={16} />
                      Approve
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleReject(request)}
                    >
                      <X size={16} />
                      Reject
                    </Button>
                  </div>
                ) : request.user_id === user?.id ? (
                  <span className="text-sm text-muted-foreground">Your request</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Admin only</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
