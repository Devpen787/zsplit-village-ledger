
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
  const [name, setName] = useState('');
  const { inviteMember } = useGroupInvites(groupId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setLoading(true);
    try {
      console.log("[INVITE DIALOG] Starting invitation for:", email.trim(), "with name:", name.trim());
      const result = await inviteMember(email.trim(), invitedBy, name.trim() || undefined);
      
      if (result?.success) {
        console.log("[INVITE DIALOG] Invitation successful, clearing form and refreshing");
        
        // Clear form and close dialog
        setEmail('');
        setName('');
        onOpenChange(false);
        
        // Trigger refresh immediately
        if (onMemberAdded) {
          console.log("[INVITE DIALOG] Triggering member list refresh");
          onMemberAdded();
        }
      }
      
    } catch (error) {
      console.error('[INVITE DIALOG] Error in invitation flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setName('');
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter their name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          
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
              They'll be added immediately and can claim their account when they sign up.
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
