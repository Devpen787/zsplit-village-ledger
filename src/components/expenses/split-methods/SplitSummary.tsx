
import React from "react";
import { UserSplitData } from "@/types/expenses";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SplitSummaryProps {
  splitData: UserSplitData[];
  totalAmount: number;
  paidBy: string;
  getCalculatedAmount: (userData: UserSplitData) => number;
  getUserName: (userId: string) => string;
  splitMethod: string;
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  onInputChange?: (userId: string, value: string, field: 'amount' | 'percentage' | 'shares') => void;
  adjustShares?: (userId: string, adjustment: number) => void;
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
  adjustShares,
}) => {
  // Get initials from user name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getInputField = (userData: UserSplitData) => {
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
            onClick={() => adjustShares?.(userId, -1)}
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
          onChange={(e) => onInputChange?.(userId, e.target.value, fieldType)}
          disabled={!selectedUsers[userId]}
        />
        
        {splitMethod === "shares" && (
          <button 
            type="button"
            className={cn(
              "p-1 rounded-md text-xs bg-gray-200 hover:bg-gray-300",
              !selectedUsers[userId] && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => adjustShares?.(userId, 1)}
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
        {splitData.map((data) => {
          const userName = getUserName(data.userId);
          const amount = getCalculatedAmount(data);
          const initials = getInitials(userName);
          const isActive = selectedUsers[data.userId] !== false;
          
          return (
            <TableRow key={data.userId} className={!isActive ? "opacity-60" : ""}>
              <TableCell>
                <Checkbox 
                  checked={isActive}
                  onCheckedChange={() => toggleUser(data.userId)}
                  id={`user-check-${data.userId}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-7 w-7 mr-2">
                    <AvatarFallback className={cn(
                      "text-xs",
                      data.userId === paidBy ? "bg-green-100 text-green-800" : ""
                    )}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    data.userId === paidBy ? "font-medium text-green-600" : "",
                    !isActive && "line-through"
                  )}>
                    {userName} {data.userId === paidBy ? "(paid)" : ""}
                  </span>
                </div>
              </TableCell>
              {splitMethod !== "equal" ? (
                <TableCell>{getInputField(data)}</TableCell>
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
