import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts";
import { Loader2, Plus, X, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useCreateGroup } from "@/hooks/useCreateGroup";

const emojiOptions = ["🏠", "🏖️", "🏕️", "🚗", "🏔️", "🌮", "🍕", "🍻", "💼", "🎮"];

interface GroupMember {
  id: string;
  name: string;
  email?: string;
  isCreator: boolean;
}

interface GroupCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (group: any) => void;
  groups?: any[];
}

export const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  open,
  onOpenChange,
  onGroupCreated,
  groups = [],
}) => {
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🏠");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const { user } = useAuth();
  const { createGroupWithMembership, isCreating } = useCreateGroup();

  // Initialize creator as first member when modal opens
  React.useEffect(() => {
    if (open && user && members.length === 0) {
      setMembers([{
        id: user.id,
        name: user.name || user.email || "Me",
        email: user.email,
        isCreator: true
      }]);
    }
  }, [open, user, members.length]);

  const addMember = () => {
    if (!newMemberName.trim()) {
      toast.error("Please enter a member name");
      return;
    }

    const newMember: GroupMember = {
      id: `temp_${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined,
      isCreator: false
    };

    setMembers(prev => [...prev, newMember]);
    setNewMemberName("");
    setNewMemberEmail("");
  };

  const removeMember = (memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to create a group");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (members.length === 0) {
      toast.error("At least one member is required");
      return;
    }

    // Check if user already has a group with the same name
    const duplicateGroup = groups.find(group => 
      group.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (duplicateGroup) {
      toast.error("You already have a group with that name.");
      return;
    }

    try {
      const result = await createGroupWithMembership({
        name: name.trim(),
        icon: selectedEmoji,
        created_by: user.id
      }, members);
      
      if (result) {
        // Close modal and reset form
        onOpenChange(false);
        resetForm();
        
        // Call the callback to refresh data
        onGroupCreated(result);
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      
      if (error.message && error.message.includes('unique_group_name_per_user')) {
        toast.error("You already have a group with this name.");
        return;
      }
      
      if (error.message) {
        if (error.code || error.details || error.hint) {
          toast.error("Failed to create group. Please try again.");
        } else {
          toast.error(`Unexpected error: ${error.message}`);
        }
      } else {
        toast.error("Failed to create group. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedEmoji("🏠");
    setMembers([]);
    setNewMemberName("");
    setNewMemberEmail("");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to track and split expenses with friends, family, or colleagues.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateGroup}>
          <div className="grid gap-4 py-4">
            {/* Group Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Trip to Paris"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Group Icon */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <div className="flex flex-wrap gap-2 col-span-3">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-md hover:bg-accent ${
                      selectedEmoji === emoji ? "bg-primary/20 border-2 border-primary" : "bg-secondary"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Section */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">
                Members
              </Label>
              <div className="col-span-3 space-y-3">
                {/* Current Members */}
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {member.name} {member.isCreator && "(You)"}
                          </span>
                          {member.email && (
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          )}
                        </div>
                      </div>
                      {!member.isCreator && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Member */}
                <div className="space-y-2 p-3 border rounded-md">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Member name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMember}
                      disabled={!newMemberName.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Email (optional)"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add members now or invite them later. Members with emails will receive invitations.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !name.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
