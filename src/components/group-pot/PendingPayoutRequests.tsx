
import React from 'react';
import { PotActivity } from '@/types/group-pot';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';

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
  const { user } = useAuth();
  
  // Filter only pending payout requests
  let pendingRequests = activities.filter(
    activity => activity.type === 'payout' && activity.status === 'pending'
  );

  // Add demo pending requests if none exist and we're in a development environment
  if (pendingRequests.length === 0 && process.env.NODE_ENV === 'development') {
    // Demo data for testing purposes - these will only show in development
    const demoRequests: PotActivity[] = [
      {
        id: 'demo-request-1',
        group_id: '',
        user_id: 'demo-user-1',
        type: 'payout',
        amount: 75.50,
        status: 'pending',
        note: 'Pizza for group meeting',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
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
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        users: {
          name: 'Sam Wilson', 
          email: 'sam@example.com',
          wallet_address: null
        }
      }
    ];
    
    // Add the demo requests to our list
    pendingRequests = [...demoRequests];
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
                <p className="font-medium">
                  {request.users?.name || request.users?.email || 'Unknown user'}
                </p>
                {request.users?.wallet_address && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Wallet className="h-3 w-3 mr-1" />
                    Wallet: {shortenAddress(request.users.wallet_address)}
                  </p>
                )}
                {!request.users?.wallet_address && (
                  <p className="text-xs text-muted-foreground">No wallet connected</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {request.created_at && formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </p>
                <p className="font-medium">{request.amount.toFixed(2)} CHF</p>
                {request.note && <p className="text-sm mt-1">{request.note}</p>}
              </div>
              
              {/* Show approve/reject buttons only for admins and not for self-requests */}
              {isAdmin && request.user_id !== user?.id && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleReject(request)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleApprove(request)}
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
              
              {/* Show message for own requests */}
              {request.user_id === user?.id && (
                <div className="text-sm text-muted-foreground">
                  Your request - awaiting approval
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
