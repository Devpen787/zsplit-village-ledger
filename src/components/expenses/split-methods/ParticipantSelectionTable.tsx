
import React from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import TableHeader from "./TableHeader";
import UserTableRow from "./UserTableRow";

interface ParticipantSelectionTableProps {
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

const ParticipantSelectionTable: React.FC<ParticipantSelectionTableProps> = ({
  splitData,
  users,
  paidBy,
  selectedUsers,
  toggleUser,
  splitMethod,
  handleInputChange,
  adjustShares,
  getCalculatedAmount,
}) => {
  // Find matching split data for a user
  const findSplitData = (userId: string): UserSplitData | undefined => {
    return splitData.find(data => data.userId === userId);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader splitMethod={splitMethod} />
          <TableBody>
            {users.map((user) => {
              const userData = findSplitData(user.id);
              if (!userData) return null;
              
              const isActive = selectedUsers[user.id] !== false;
              const isPayer = user.id === paidBy;
              
              return (
                <UserTableRow 
                  key={user.id}
                  user={user}
                  userData={userData}
                  isPayer={isPayer}
                  isActive={isActive}
                  splitMethod={splitMethod}
                  selectedUsers={selectedUsers}
                  toggleUser={toggleUser}
                  handleInputChange={handleInputChange}
                  adjustShares={adjustShares}
                  getCalculatedAmount={getCalculatedAmount}
                />
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ParticipantSelectionTable;
