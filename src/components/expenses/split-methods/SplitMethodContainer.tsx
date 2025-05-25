
import React from 'react';
import { UserSplitData, ExpenseUser } from '@/types/expenses';
import { useExpenseSplit } from '@/hooks/useExpenseSplit';
import { useExpenseSplitMethods } from '@/hooks/useExpenseSplitMethods';
import SplitMethodSelector from './SplitMethodSelector';
import ParticipantSection from './ParticipantSection';
import SplitSummarySection from './SplitSummarySection';
import ValidationAlert from './ValidationAlert';
import GroupContext from './GroupContext';
import EmptyParticipantsState from './EmptyParticipantsState';

interface SplitMethodContainerProps {
  users: ExpenseUser[];
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  totalAmount: number;
  paidBy: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  groupName?: string | null;
  groupId?: string | null;
}

export const SplitMethodContainer: React.FC<SplitMethodContainerProps> = ({
  users,
  splitMethod,
  setSplitMethod,
  totalAmount,
  paidBy,
  onSplitDataChange,
  groupName,
  groupId
}) => {
  // Early return for empty users
  if (users.length === 0) {
    return (
      <EmptyParticipantsState
        splitMethod={splitMethod}
        setSplitMethod={setSplitMethod}
      />
    );
  }

  // Use our split methods management hook
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

  // Use the split calculations hook
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

  const handleUserToggle = (userId: string) => {
    toggleUser(userId);
    toggleUserActive(userId, !selectedUsers[userId]);
  };

  return (
    <div className="space-y-4">
      {/* Group Context */}
      {groupName && <GroupContext groupName={groupName} />}
      
      {/* Split Method Selection */}
      <div className="space-y-2">
        <SplitMethodSelector 
          splitMethod={splitMethod}
          setSplitMethod={setSplitMethod}
        />
        
        {/* Validation Error */}
        {validationError && (
          <ValidationAlert validationError={validationError} />
        )}
      </div>
      
      {/* Participant Selection */}
      <ParticipantSection
        splitData={splitData}
        users={sortedUsers}
        paidBy={paidBy}
        groupId={groupId}
        selectedUsers={selectedUsers}
        toggleUser={handleUserToggle}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onSelectGroup={handleSelectGroup}
        splitMethod={splitMethod}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
        getCalculatedAmount={getCalculatedAmount}
        availableGroups={availableGroups}
      />
      
      {/* Split Summary */}
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
        toggleUser={handleUserToggle}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
      />
    </div>
  );
};
