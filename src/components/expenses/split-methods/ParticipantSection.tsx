
import React from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import ParticipantSelectionTable from "./ParticipantSelectionTable";
import { Label } from "@/components/ui/label";
import UserSelectionControls from "./UserSelectionControls";

interface ParticipantSectionProps {
  splitData: UserSplitData[];
  users: ExpenseUser[];
  paidBy: string;
  groupId?: string | null;
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectGroup: () => void;
  splitMethod: string;
  handleInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
  getCalculatedAmount: (userData: UserSplitData) => number;
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
  getCalculatedAmount
}) => {
  return (
    <div className="space-y-2">
      <Label>Split with</Label>
      
      {/* Bulk selection controls */}
      <UserSelectionControls
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onSelectGroup={onSelectGroup}
        groupId={groupId}
      />
      
      <ParticipantSelectionTable
        splitData={splitData}
        users={users}
        paidBy={paidBy}
        groupId={groupId}
        selectedUsers={selectedUsers}
        toggleUser={toggleUser}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onSelectGroup={onSelectGroup}
        splitMethod={splitMethod}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
        getCalculatedAmount={getCalculatedAmount}
      />
    </div>
  );
};

export default ParticipantSection;
