
import React from "react";
import { UserSplitData } from "@/types/expenses";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}

const SplitSummary: React.FC<SplitSummaryProps> = ({
  splitData,
  totalAmount,
  paidBy,
  getCalculatedAmount,
  getUserName,
  splitMethod,
}) => {
  if (!totalAmount || totalAmount <= 0) return null;
  
  // Get initials from user name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Person</TableHead>
          {splitMethod !== "equal" && (
            <TableHead>
              {splitMethod === "percentage" ? "%" : 
               splitMethod === "shares" ? "Shares" : ""}
            </TableHead>
          )}
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {splitData.map((data) => {
          const userName = getUserName(data.userId);
          const amount = getCalculatedAmount(data);
          const initials = getInitials(userName);
          
          let additionalInfo = "";
          switch (splitMethod) {
            case "percentage":
              additionalInfo = `${data.percentage?.toFixed(1) || 0}%`;
              break;
            case "shares":
              additionalInfo = `${data.shares || 1} ${data.shares === 1 ? 'share' : 'shares'}`;
              break;
          }
          
          return (
            <TableRow key={data.userId}>
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
                    data.userId === paidBy ? "font-medium text-green-600" : ""
                  )}>
                    {userName} {data.userId === paidBy ? "(paid)" : ""}
                  </span>
                </div>
              </TableCell>
              {splitMethod !== "equal" && (
                <TableCell>{additionalInfo}</TableCell>
              )}
              <TableCell className="text-right font-medium">
                {amount.toFixed(2)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default SplitSummary;
