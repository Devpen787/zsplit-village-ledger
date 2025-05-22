
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

interface SplitSummaryProps {
  splitData: UserSplitData[];
  totalAmount: number;
  paidBy: string;
  getCalculatedAmount: (userData: UserSplitData) => number;
  getUserName: (userId: string) => string;
}

const SplitSummary: React.FC<SplitSummaryProps> = ({
  splitData,
  totalAmount,
  paidBy,
  getCalculatedAmount,
  getUserName,
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
          <div className="space-y-2">
            {splitData.map((data) => {
              const userName = getUserName(data.userId);
              const amount = getCalculatedAmount(data);
              const initials = getInitials(userName);
              
              return (
                <div key={data.userId} className="flex items-center justify-between">
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
                  <span className="font-medium">
                    {amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SplitSummary;
