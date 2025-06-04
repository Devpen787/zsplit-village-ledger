
import { useState } from 'react';
import { createGroupSecurely } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/supabase';
import { useGroupMemberInvitations } from './useGroupMemberInvitations';

interface GroupMember {
  id: string;
  name: string;
  email?: string;
  isCreator: boolean;
}

export const useCreateGroup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { inviteMembers } = useGroupMemberInvitations();

  const createGroupWithMembership = async (
    groupData: {
      name: string;
      icon: string;
      created_by: string;
    },
    members: GroupMember[] = []
  ): Promise<Group | null> => {
    if (isCreating) {
      console.warn("Group creation already in progress");
      return null;
    }

    setIsCreating(true);
    
    try {
      console.log("🚀 Creating group with membership:", groupData);
      console.log("🚀 Members to process:", members);
      
      // Use the secure Edge Function to create the group AND add membership
      const result = await createGroupSecurely(groupData);
      
      console.log("✅ Group creation result:", result);
      
      // Verify that membership was created
      if (!result.membershipCreated) {
        throw new Error("Group created but membership was not established");
      }
      
      console.log("✅ Group and membership created successfully");
      
      // Process member invitations if any members were added
      if (members.length > 0) {
        console.log("📧 Processing member invitations...");
        await inviteMembers(result.id, members, groupData.created_by);
      }
      
      toast.success(`Group "${result.name}" created successfully!`);
      
      // Wait a moment to ensure database consistency before navigation
      setTimeout(() => {
        console.log("🧭 Navigating to group:", result.id);
        navigate(`/group/${result.id}`);
      }, 500); // Increased delay to ensure consistency
      
      return result;
      
    } catch (error: any) {
      console.error("❌ Error creating group:", error);
      
      // Provide specific error messages
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
      
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createGroupWithMembership,
    isCreating
  };
};
