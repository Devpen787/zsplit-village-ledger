
import React from "react";
import { UserSplitData } from "@/types/expenses";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/utils/money";

interface SplitSummaryCollapsibleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  splitData: UserSplitData[];
  selectedUsers: Record<string, boolean>;
  getUserName: (userData: any) => string;
  getCalculatedAmount: (userData: UserSplitData) => number;
}

const SplitSummaryCollapsible: React.FC<SplitSummaryCollapsibleProps> = ({
  isOpen,
  setIsOpen,
  splitData,
  selectedUsers,
  getUserName,
  getCalculatedAmount
}) => {
  // Only show active users
  const activeUsers = splitData.filter(item => selectedUsers[item.userId] !== false);
  
  return (
    <div className="mt-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full flex justify-between items-center text-sm font-medium text-muted-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Summary</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-muted/50 rounded-md">
          <ul className="space-y-1">
            {activeUsers.map(userData => {
              const name = getUserName(userData);
              const amount = getCalculatedAmount(userData);
              
              return (
                <li key={userData.userId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{name}</span>
                  <span className={cn(
                    "font-medium", 
                    amount > 0 ? "text-green-600" : ""
                  )}>
                    {formatAmount(amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SplitSummaryCollapsible;
