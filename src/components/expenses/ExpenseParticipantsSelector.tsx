
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Users } from "lucide-react";
import { ExpenseUser } from "@/types/expenses";
import { Label } from "@/components/ui/label";
import ParticipantSelectionTable from "./split-methods/ParticipantSelectionTable";

interface ExpenseParticipantsSelectorProps {
  users: ExpenseUser[];
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  paidBy: string;
  groupId?: string | null;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectGroup: () => void;
  formatUserName: (user: ExpenseUser) => string;
}

const ExpenseParticipantsSelector: React.FC<ExpenseParticipantsSelectorProps> = ({
  users,
  selectedUsers,
  toggleUser,
  paidBy,
  groupId,
  onSelectAll,
  onDeselectAll,
  onSelectGroup,
  formatUserName
}) => {
  return (
    <div className="space-y-2">
      <Label>Split with</Label>
      
      {/* Bulk selection controls */}
      <div className="flex flex-wrap gap-2 mb-2">
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={onSelectAll}
          className="flex items-center"
        >
          <UserCheck className="h-4 w-4 mr-1" />
          Select All
        </Button>
        
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={onDeselectAll}
          className="flex items-center"
        >
          <UserX className="h-4 w-4 mr-1" />
          Deselect All
        </Button>
        
        {groupId && (
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={onSelectGroup}
            className="flex items-center"
          >
            <Users className="h-4 w-4 mr-1" />
            Select Group Only
          </Button>
        )}
      </div>
      
      <ParticipantSelectionTable
        splitData={users.map(user => ({
          userId: user.id,
          isActive: selectedUsers[user.id] !== false,
          name: user.name,
          email: user.email,
          display_name: user.display_name
        }))}
        users={users}
        paidBy={paidBy}
        groupId={groupId}
        selectedUsers={selectedUsers}
        toggleUser={toggleUser}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onSelectGroup={onSelectGroup}
        splitMethod="equal" // Default, will be overridden by parent
        handleInputChange={() => {}} // Will be overridden by parent
        adjustShares={() => {}} // Will be overridden by parent
        getCalculatedAmount={() => 0} // Will be overridden by parent
      />
    </div>
  );
};

export default ExpenseParticipantsSelector;
