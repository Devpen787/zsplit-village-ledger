
import React from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import ParticipantSelectionTable from "./ParticipantSelectionTable";
import { Label } from "@/components/ui/label";

interface ParticipantSectionProps {
  splitData: UserSplitData[];
  users: ExpenseUser[];
  paidBy: string;
  groupId?: string | null;
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectGroup: (groupId: string) => void;
  splitMethod: string;
  handleInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
  getCalculatedAmount: (userData: UserSplitData) => number;
  availableGroups?: Record<string, string>;
}

const ParticipantSection: React.FC<ParticipantSectionProps> = ({
  splitData,
  users,
  paidBy,
  groupId,
  selectedUsers,
  toggleUser,
  onSelectAll,
  onDeselectAll,
  onSelectGroup,
  splitMethod,
  handleInputChange,
  adjustShares,
  getCalculatedAmount,
  availableGroups = {}
}) => {
  return (
    <div className="space-y-2">
      <Label>Split with</Label>
      
      {/* Single unified table with built-in selection controls */}
      <ParticipantSelectionTable
        splitData={splitData}
        users={users}
        paidBy={paidBy}
        groupId={groupId}
        selectedUsers={selectedUsers}
        toggleUser={toggleUser}
        splitMethod={splitMethod}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
        getCalculatedAmount={getCalculatedAmount}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onSelectGroup={onSelectGroup}
        availableGroups={availableGroups}
      />
    </div>
  );
};

export default ParticipantSection;
