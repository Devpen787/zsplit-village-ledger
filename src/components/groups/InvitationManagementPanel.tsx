
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, UserPlus, RefreshCw, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useInvitationManagement } from '@/hooks/useInvitationManagement';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface InvitationManagementPanelProps {
  groupId: string;
  isAdmin: boolean;
  onInviteClick: () => void;
}

export const InvitationManagementPanel = ({ 
  groupId, 
  isAdmin, 
  onInviteClick 
}: InvitationManagementPanelProps) => {
  const { sentInvitations, loading, cancelInvitation, resendInvitation } = useInvitationManagement(groupId);

  if (!isAdmin) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitation Management
          </CardTitle>
          <Button onClick={onInviteClick} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading invitations...</span>
          </div>
        ) : sentInvitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invitations sent yet</p>
            <Button onClick={onInviteClick} className="mt-4">
              <UserPlus className="h-4 w-4 mr-2" />
              Send First Invitation
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sentInvitations.map((invitation, index) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(invitation.status)}
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Sent {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(invitation.status)}>
                    {invitation.status}
                  </Badge>
                  
                  {invitation.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resendInvitation(invitation.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelInvitation(invitation.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
