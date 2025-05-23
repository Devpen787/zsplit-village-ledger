import { useState, useEffect } from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { formatSplitDataUserName } from "@/utils/userFormatUtils";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import { toast } from "@/components/ui/sonner";

interface UseExpenseSplitMethodsProps {
  users: ExpenseUser[];
  totalAmount: number;
  paidBy: string;
  groupId?: string | null;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
}

export const useExpenseSplitMethods = ({
  users,
  totalAmount,
  paidBy,
  groupId,
  onSplitDataChange
}: UseExpenseSplitMethodsProps) => {
  const [splitMethod, setSplitMethod] = useState<string>("equal");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>(() => {
    // Initialize all users as selected by default
    const initialSelectedUsers: Record<string, boolean> = {};
    users.forEach(user => {
      initialSelectedUsers[user.id] = true;
    });
    return initialSelectedUsers;
  });
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { members, fetchMembers } = useGroupMembers(selectedGroup || groupId || undefined);
  
  // Track all available groups for selection
  const availableGroups = users.reduce((groups: Record<string, string>, user) => {
    if (user.group_id) {
      groups[user.group_id] = user.group_id;
    }
    return groups;
  }, {});
  
  // Mark users with their active status for split calculations
  const usersWithActiveStatus = users.map(user => ({
    ...user,
    isActive: selectedUsers[user.id] !== false
  }));

  // Count how many active users we have
  const activeUserCount = Object.values(selectedUsers).filter(Boolean).length;
  
  // Toggle a single user's selection status
  const toggleUser = (userId: string) => {
    // Never deselect the user who paid
    if (userId === paidBy) return;
    
    // Update the local selected users state
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    const newSelectedUsers = { ...selectedUsers };
    users.forEach(user => {
      newSelectedUsers[user.id] = true;
    });
    setSelectedUsers(newSelectedUsers);
  };
  
  const handleDeselectAll = () => {
    const newSelectedUsers = { ...selectedUsers };
    
    // Keep the payer selected
    users.forEach(user => {
      newSelectedUsers[user.id] = (user.id === paidBy);
    });
    setSelectedUsers(newSelectedUsers);
  };
  
  const handleSelectGroup = (groupId: string) => {
    if (!groupId) return;
    
    setSelectedGroup(groupId);
    
    const newSelectedUsers = { ...selectedUsers };
    
    // Always keep the payer selected
    users.forEach(user => {
      // Select only users in the specified group or the payer
      const isInGroup = user.group_id === groupId;
      newSelectedUsers[user.id] = isInGroup || user.id === paidBy;
    });
    
    setSelectedUsers(newSelectedUsers);
    toast.success(`Selected members of the group`);
  };

  // Sort users - group members first, then alphabetically
  const sortedUsers = [...users].sort((a, b) => {
    // Payer always comes first
    if (a.id === paidBy) return -1;
    if (b.id === paidBy) return 1;
    
    // Group members come before non-members
    const aInGroup = a.group_id === groupId;
    const bInGroup = b.group_id === groupId;
    if (aInGroup && !bInGroup) return -1;
    if (!aInGroup && bInGroup) return 1;
    
    // Sort alphabetically by name or email
    const aName = a.display_name || a.email?.split('@')[0] || a.name || a.id;
    const bName = b.display_name || b.email?.split('@')[0] || b.name || b.id;
    return String(aName).toLowerCase().localeCompare(String(bName).toLowerCase());
  });

  return {
    splitMethod,
    setSplitMethod,
    selectedUsers,
    isSummaryOpen,
    setIsSummaryOpen,
    usersWithActiveStatus,
    activeUserCount,
    toggleUser,
    handleSelectAll,
    handleDeselectAll,
    handleSelectGroup,
    sortedUsers,
    formatUserName: formatSplitDataUserName,
    availableGroups,
    selectedGroup,
    setSelectedGroup
  };
};
