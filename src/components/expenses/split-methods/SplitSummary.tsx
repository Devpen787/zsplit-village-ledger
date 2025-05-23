
import React from "react";
import { UserSplitData } from "@/types/expenses";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/userFormatUtils";
import { Checkbox } from "@/components/ui/checkbox";

interface SplitSummaryProps {
  splitData: UserSplitData[];
  totalAmount: number;
  paidBy: string;
  getCalculatedAmount: (userData: UserSplitData) => number;
  getUserName: (userData: any) => string;
  splitMethod: string;
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  onInputChange: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares: (userId: string, adjustment: number) => void;
}

const SplitSummary: React.FC<SplitSummaryProps> = ({
  splitData,
  totalAmount,
  paidBy,
  getCalculatedAmount,
  getUserName,
  splitMethod,
  selectedUsers,
  toggleUser,
  onInputChange,
  adjustShares
}) => {
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
          onChange={(e) => onInputChange(userId, e.target.value, fieldType)}
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
        {splitData.map((userData) => {
          const userName = getUserName(userData);
          const initials = getUserInitials(userName);
          const isActive = selectedUsers[userData.userId] !== false;
          const isPayer = userData.userId === paidBy;
          const amount = getCalculatedAmount(userData);
          
          return (
            <TableRow key={userData.userId} className={!isActive ? "opacity-60" : ""}>
              <TableCell>
                <Checkbox 
                  checked={isActive}
                  onCheckedChange={() => toggleUser(userData.userId)}
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
                <TableCell>{renderInputField(userData)}</TableCell>
              ) : null}
              <TableCell className="text-right font-medium">
                {isActive ? amount.toFixed(2) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default SplitSummary;
