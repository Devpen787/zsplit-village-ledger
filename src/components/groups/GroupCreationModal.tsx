
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
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useCreateGroup } from "@/hooks/useCreateGroup";

const emojiOptions = ["🏠", "🏖️", "🏕️", "🚗", "🏔️", "🌮", "🍕", "🍻", "💼", "🎮"];

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
  const { user } = useAuth();
  const { createGroupWithMembership, isCreating } = useCreateGroup();

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

    const result = await createGroupWithMembership({
      name: name.trim(),
      icon: selectedEmoji,
      created_by: user.id
    });
    
    if (result) {
      // Close modal and reset form
      onOpenChange(false);
      setName("");
      setSelectedEmoji("🏠");
      
      // Call the callback to refresh data
      onGroupCreated(result);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to track and split expenses with friends, family, or colleagues.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateGroup}>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
