
import React from "react";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatUserName, getUserInitials } from "@/utils/userFormatUtils";

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

  // Render the appropriate input field based on split method
  const renderInputField = (userData: UserSplitData) => {
    if (splitMethod === "equal") return null;
    
    const userId = userData.userId;
    let value: number | undefined;
    let fieldType: 'amount' | 'percentage' | 'shares';
    let placeholder: string;
    let step: string;
    
    switch (splitMethod) {
      case "amount":
        value = userData.amount;
        fieldType = 'amount';
        placeholder = "0.00";
        step = "0.01";
        break;
      case "percentage":
        value = userData.percentage;
        fieldType = 'percentage';
        placeholder = "0";
        step = "0.1";
        break;
      case "shares":
        value = userData.shares;
        fieldType = 'shares';
        placeholder = "1";
        step = "1";
        break;
      default:
        return null;
    }
    
    return (
      <div className="flex items-center space-x-2">
        {splitMethod === "shares" && (
          <button 
            type="button"
            className={cn(
              "p-1 rounded-md text-xs bg-gray-200 hover:bg-gray-300",
              !selectedUsers[userId] && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => adjustShares(userId, -1)}
            disabled={!selectedUsers[userId] || value === 1}
          >
            -
          </button>
        )}
        
        <Input
          type="number"
          className={cn("h-8 w-20", !selectedUsers[userId] && "opacity-50")}
          placeholder={placeholder}
          step={step}
          value={value === 0 || value === undefined ? '' : value}
          onChange={(e) => handleInputChange(userId, e.target.value, fieldType)}
          disabled={!selectedUsers[userId]}
        />
        
        {splitMethod === "shares" && (
          <button 
            type="button"
            className={cn(
              "p-1 rounded-md text-xs bg-gray-200 hover:bg-gray-300",
              !selectedUsers[userId] && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => adjustShares(userId, 1)}
            disabled={!selectedUsers[userId]}
          >
            +
          </button>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Include</TableHead>
              <TableHead>Person</TableHead>
              {splitMethod !== "equal" && (
                <TableHead>
                  {splitMethod === "percentage" ? "%" : 
                  splitMethod === "shares" ? "Shares" : "Amount"}
                </TableHead>
              )}
              <TableHead className="text-right">Final Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const userData = findSplitData(user.id);
              if (!userData) return null;
              
              const userName = formatUserName(user);
              const initials = getUserInitials(userName);
              const isActive = selectedUsers[user.id] !== false;
              const isPayer = user.id === paidBy;
              const amount = userData ? getCalculatedAmount(userData) : 0;
              
              return (
                <TableRow key={user.id} className={!isActive ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={isActive}
                      onCheckedChange={() => toggleUser(user.id)}
                      id={`user-check-${user.id}`}
                      disabled={isPayer} // Can't deselect the payer
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-7 w-7 mr-2">
                        <AvatarFallback className={cn(
                          "text-xs",
                          isPayer ? "bg-green-100 text-green-800" : ""
                        )}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        isPayer ? "font-medium text-green-600" : "",
                        !isActive && "line-through"
                      )}>
                        {userName}
                        {isPayer && (
                          <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            paid
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  {splitMethod !== "equal" ? (
                    <TableCell>{userData && renderInputField(userData)}</TableCell>
                  ) : null}
                  <TableCell className="text-right font-medium">
                    {isActive ? amount.toFixed(2) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ParticipantSelectionTable;
