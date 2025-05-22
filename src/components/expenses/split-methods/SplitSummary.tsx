
import React, { useState } from "react";
import { UserSplitData } from "@/types/expenses";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
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
  const [isOpen, setIsOpen] = useState(true);
  
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

  const isLargeGroup = splitData.length > 5;
  
  return (
    <div className="mt-6 border rounded-md p-3 bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <h4 className="text-base font-medium">Split Breakdown</h4>
          <div className="flex items-center text-muted-foreground">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SplitSummary;
