
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts';
import { toast } from '@/components/ui/sonner';

interface RequestApprovalActionsProps {
  requestUserId: string;
  isAdmin: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline';
  className?: string;
}

export const RequestApprovalActions = ({
  requestUserId,
  isAdmin,
  onApprove,
  onReject,
  size = 'sm',
  variant = 'outline',
  className = ''
}: RequestApprovalActionsProps) => {
  const { user } = useAuth();
  
  const handleApprove = async () => {
    if (requestUserId === user?.id) {
      toast.error("You cannot approve your own requests");
      return;
    }
    await onApprove();
  };

  const handleReject = async () => {
    if (requestUserId === user?.id) {
      toast.error("You cannot reject your own requests");
      return;
    }
    await onReject();
  };

  // Show approve/reject buttons only for admins and not for self-requests
  if (!isAdmin || requestUserId === user?.id) {
    return (
      <div className="text-sm text-muted-foreground">
        {requestUserId === user?.id ? "Your request - awaiting approval" : "Admin only"}
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button 
        variant={variant}
        size={size}
        onClick={handleReject}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <XCircle className="mr-1 h-4 w-4" />
        Reject
      </Button>
      <Button 
        variant={variant}
        size={size}
        onClick={handleApprove}
        className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
      >
        <CheckCircle className="mr-1 h-4 w-4" />
        Approve
      </Button>
    </div>
  );
};
