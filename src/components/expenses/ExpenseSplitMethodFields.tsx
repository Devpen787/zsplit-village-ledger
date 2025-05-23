
import React from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { useExpenseSplit } from "@/hooks/useExpenseSplit";
import { useExpenseSplitMethods } from "@/hooks/useExpenseSplitMethods";
import GroupContext from "./split-methods/GroupContext";
import EmptyParticipantsState from "./split-methods/EmptyParticipantsState";
import ParticipantSection from "./split-methods/ParticipantSection";
import SplitSummarySection from "./split-methods/SplitSummarySection";
import SplitMethodSelectorContainer from "./split-methods/SplitMethodSelectorContainer";

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
  // Use our new hook for split methods management
  const {
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
    formatUserName,
    availableGroups
  } = useExpenseSplitMethods({
    users,
    totalAmount,
    paidBy,
    groupId,
    onSplitDataChange
  });

  // Use the original hook for split calculations
  const {
    splitData,
    validationError,
    handleInputChange,
    adjustShares,
    getCalculatedAmount,
    toggleUserActive
  } = useExpenseSplit({
    users: usersWithActiveStatus,
    totalAmount,
    paidBy,
    splitMethod,
    onSplitDataChange
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

  return (
    <div className="space-y-4">
      {/* Group Context if provided */}
      <GroupContext groupName={groupName} />
      
      {/* Split Method Selection and Validation */}
      <SplitMethodSelectorContainer 
        splitMethod={splitMethod}
        setSplitMethod={setSplitMethod}
        validationError={validationError}
      />
      
      {/* Participant Selection with Bulk Controls */}
      <ParticipantSection
        splitData={splitData}
        users={sortedUsers}
        paidBy={paidBy}
        groupId={groupId}
        selectedUsers={selectedUsers}
        toggleUser={(userId) => {
          toggleUser(userId);
          toggleUserActive(userId, !selectedUsers[userId]);
        }}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onSelectGroup={handleSelectGroup}
        splitMethod={splitMethod}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
        getCalculatedAmount={getCalculatedAmount}
        availableGroups={availableGroups}
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
        getUserName={formatUserName}
        getCalculatedAmount={getCalculatedAmount}
        toggleUser={(userId) => {
          toggleUser(userId);
          toggleUserActive(userId, !selectedUsers[userId]);
        }}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
      />
    </div>
  );
};

export default ExpenseSplitMethodFields;
