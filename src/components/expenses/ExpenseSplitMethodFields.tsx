
import React, { useState, useEffect } from "react";
import SplitMethodSelector from "./split-methods/SplitMethodSelector";
import ValidationAlert from "./split-methods/ValidationAlert";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { useExpenseSplit } from "@/hooks/useExpenseSplit";
import GroupContext from "./split-methods/GroupContext";
import EmptyParticipantsState from "./split-methods/EmptyParticipantsState";
import ParticipantSection from "./split-methods/ParticipantSection";
import SplitSummarySection from "./split-methods/SplitSummarySection";
import { formatSplitDataUserName } from "@/utils/userFormatUtils";

interface ExpenseSplitMethodFieldsProps {
  users: ExpenseUser[];
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  totalAmount: number;
  paidBy: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  groupName?: string | null;
  groupId?: string | null;
}

const ExpenseSplitMethodFields: React.FC<ExpenseSplitMethodFieldsProps> = ({
  users,
  splitMethod,
  setSplitMethod,
  totalAmount,
  paidBy,
  onSplitDataChange,
  groupName,
  groupId
}) => {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>(() => {
    // Initialize all users as selected by default
    const initialSelectedUsers: Record<string, boolean> = {};
    users.forEach(user => {
      initialSelectedUsers[user.id] = true;
    });
    return initialSelectedUsers;
  });

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  // Mark users with their active status for split calculations
  const usersWithActiveStatus = users.map(user => ({
    ...user,
    isActive: selectedUsers[user.id] !== false
  }));

  const {
    splitData,
    validationError,
    handleInputChange,
    adjustShares,
    getCalculatedAmount,
    getTotalShares,
    getUserName,
    toggleUserActive
  } = useExpenseSplit({
    users: usersWithActiveStatus,
    totalAmount,
    paidBy,
    splitMethod,
    onSplitDataChange
  });
  
  // Toggle a single user's selection status
  const toggleUser = (userId: string) => {
    // Never deselect the user who paid
    if (userId === paidBy) return;
    
    // Update the local selected users state
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    
    // Also update the active status in the split data
    toggleUserActive(userId, !selectedUsers[userId]);
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    const newSelectedUsers = { ...selectedUsers };
    users.forEach(user => {
      newSelectedUsers[user.id] = true;
    });
    setSelectedUsers(newSelectedUsers);
    
    // Update all users as active in the split data
    users.forEach(user => {
      toggleUserActive(user.id, true);
    });
  };
  
  const handleDeselectAll = () => {
    const newSelectedUsers = { ...selectedUsers };
    
    // Keep the payer selected
    users.forEach(user => {
      newSelectedUsers[user.id] = (user.id === paidBy);
    });
    setSelectedUsers(newSelectedUsers);
    
    // Update all non-payer users as inactive
    users.forEach(user => {
      if (user.id !== paidBy) {
        toggleUserActive(user.id, false);
      }
    });
  };
  
  const handleSelectGroup = () => {
    if (!groupId) return;
    
    const newSelectedUsers = { ...selectedUsers };
    
    // Always keep the payer selected
    users.forEach(user => {
      // Select only users in the current group or the payer
      const isInGroup = user.group_id === groupId;
      newSelectedUsers[user.id] = isInGroup || user.id === paidBy;
      
      // Update active status in split data
      toggleUserActive(user.id, isInGroup || user.id === paidBy);
    });
    
    setSelectedUsers(newSelectedUsers);
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
  
  // If no users are available, show a message
  if (users.length === 0) {
    return (
      <EmptyParticipantsState
        splitMethod={splitMethod}
        setSplitMethod={setSplitMethod}
      />
    );
  }

  // Count how many active users we have
  const activeUserCount = Object.values(selectedUsers).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Group Context if provided */}
      <GroupContext groupName={groupName} />
      
      {/* Split Method Selector */}
      <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
      
      {/* Validation Alert */}
      <ValidationAlert validationError={validationError} />
      
      {/* Participant Selection with Bulk Controls */}
      <ParticipantSection
        splitData={splitData}
        users={sortedUsers}
        paidBy={paidBy}
        groupId={groupId}
        selectedUsers={selectedUsers}
        toggleUser={toggleUser}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onSelectGroup={handleSelectGroup}
        splitMethod={splitMethod}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
        getCalculatedAmount={getCalculatedAmount}
      />
      
      {/* Split Summary Section */}
      <SplitSummarySection
        splitData={splitData}
        totalAmount={totalAmount}
        paidBy={paidBy}
        selectedUsers={selectedUsers}
        activeUserCount={activeUserCount}
        splitMethod={splitMethod}
        isSummaryOpen={isSummaryOpen}
        setIsSummaryOpen={setIsSummaryOpen}
        getUserName={formatSplitDataUserName}
        getCalculatedAmount={getCalculatedAmount}
        toggleUser={toggleUser}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
      />
    </div>
  );
};

export default ExpenseSplitMethodFields;
