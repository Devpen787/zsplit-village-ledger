
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
import { supabase } from "@/integrations/supabase/client";
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
    if (!user) return;
    
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setLoading(true);
    try {
      // Create a new group - use type assertion to bypass TypeScript errors
      const { data: groupData, error: groupError } = await (supabase
        .from('groups') as any)
        .insert({
          name: name.trim(),
          icon: selectedEmoji,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;
      
      // Add the creator as a member
      const { error: memberError } = await (supabase
        .from('group_members') as any)
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      onGroupCreated(groupData);
      setName("");
      setSelectedEmoji("🏠");
      
      // If this is the user's first group (or only group), navigate directly to it
      if (groups.length === 0) {
        setTimeout(() => {
          navigate(`/group/${groupData.id}`);
        }, 300);
      }
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(`Failed to create group: ${error.message}`);
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
