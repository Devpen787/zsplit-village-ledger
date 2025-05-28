
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { useGroupInvitations } from '@/hooks/useGroupInvitations';

interface ImprovedInviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  invitedBy: string;
}

export const ImprovedInviteMemberDialog = ({ 
  open, 
  onOpenChange, 
  groupId,
  invitedBy
}: ImprovedInviteMemberDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const { sendInvitation, loading } = useGroupInvitations(groupId);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    try {
      await sendInvitation(inviteEmail.trim(), invitedBy);
      setInviteEmail("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invite Member
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInviteMember}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter their email address"
                required
              />
              <p className="text-xs text-muted-foreground">
                They must already have an account to receive the invitation.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !inviteEmail.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
