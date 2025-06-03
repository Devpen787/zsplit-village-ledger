
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, UserCheck } from "lucide-react";
import { useGroupInvites } from '@/hooks/useGroupInvites';

interface ImprovedInviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  invitedBy: string;
  onMemberAdded?: () => void;
}

export const ImprovedInviteMemberDialog = ({
  open,
  onOpenChange,
  groupId,
  invitedBy,
  onMemberAdded
}: ImprovedInviteMemberDialogProps) => {
  const [email, setEmail] = useState('');
  const { inviteMember } = useGroupInvites(groupId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setLoading(true);
    try {
      console.log("[INVITE DIALOG] Starting invitation for:", email.trim());
      await inviteMember(email.trim(), invitedBy);
      
      // Clear form and close dialog on success
      setEmail('');
      onOpenChange(false);
      
      // Trigger refresh of member data
      if (onMemberAdded) {
        console.log("[INVITE DIALOG] Triggering member list refresh");
        onMemberAdded();
      }
      
    } catch (error) {
      console.error('[INVITE DIALOG] Error in invitation flow:', error);
      // Error toast is already shown in the hook
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Invite Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-sm text-muted-foreground">
              If the user has an account, they'll be added immediately. 
              Otherwise, they'll receive an invitation when they sign up.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
