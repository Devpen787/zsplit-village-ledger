
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ExpenseUser, UserSplitData } from "@/types/expenses";
import { formatUserName, getUserInitials } from "@/utils/userFormatUtils";
import TableInputField from "./TableInputField";

interface UserTableRowProps {
  user: ExpenseUser;
  userData: UserSplitData | undefined;
  isPayer: boolean;
  isActive: boolean;
  splitMethod: string;
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  handleInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
  getCalculatedAmount: (userData: UserSplitData) => number;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  userData,
  isPayer,
  isActive,
  splitMethod,
  selectedUsers,
  toggleUser,
  handleInputChange,
  adjustShares,
  getCalculatedAmount
}) => {
  const userName = formatUserName(user);
  const initials = getUserInitials(userName);
  const amount = userData ? getCalculatedAmount(userData) : 0;
  
  // Prepare input field props based on split method
  const renderInputField = () => {
    if (!userData || splitMethod === "equal") return null;
    
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
      <TableInputField
        userId={user.id}
        value={value}
        fieldType={fieldType}
        placeholder={placeholder}
        step={step}
        selectedUsers={selectedUsers}
        handleInputChange={handleInputChange}
        adjustShares={adjustShares}
      />
    );
  };

  return (
    <TableRow className={!isActive ? "opacity-60" : ""}>
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
      {splitMethod !== "equal" && (
        <TableCell>{renderInputField()}</TableCell>
      )}
      <TableCell className="text-right font-medium">
        {isActive ? amount.toFixed(2) : "—"}
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
