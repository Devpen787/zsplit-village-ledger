
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { createGroupSecurely } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

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
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

    setLoading(true);
    try {
      console.log("🚀 Creating group with user ID:", user.id);
      
      // Use the secure Edge Function to create the group AND add membership
      const groupData = await createGroupSecurely({
        name: name.trim(),
        icon: selectedEmoji,
        created_by: user.id
      });
      
      console.log("✅ Group and membership created successfully:", groupData);
      
      // Verify that membership was created
      if (!groupData.membershipCreated) {
        throw new Error("Group created but membership was not established");
      }
      
      // Close modal and reset form
      onOpenChange(false);
      setName("");
      setSelectedEmoji("🏠");
      
      // Show success message
      toast.success(`Group "${groupData.name}" created successfully!`);
      
      // Call the callback to refresh data
      onGroupCreated(groupData);
      
      // Wait a moment to ensure all database operations are fully committed
      console.log("⏳ Waiting for database consistency before navigation...");
      setTimeout(() => {
        console.log("🧭 Navigating to group:", groupData.id);
        navigate(`/group/${groupData.id}`);
      }, 200); // Reduced delay since we now confirm membership creation
      
    } catch (error: any) {
      console.error("❌ Error creating group:", error);
      
      // Provide more specific error messages
      if (error.message?.includes('User not found')) {
        toast.error("Unable to create group: User profile not found. Please try refreshing the page.");
      } else if (error.message?.includes('duplicate key')) {
        toast.error("A group with this name already exists. Please choose a different name.");
      } else if (error.message?.includes('Failed to add creator as member')) {
        toast.error("Group creation failed: Unable to establish membership. Please try again.");
      } else if (error.message?.includes('membership was not established')) {
        toast.error("Group created but access setup failed. Please try refreshing the page.");
      } else {
        toast.error(`Failed to create group: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
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
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
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
