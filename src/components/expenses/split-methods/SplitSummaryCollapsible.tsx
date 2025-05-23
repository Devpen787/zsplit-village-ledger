
import React from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronUp, ChevronDown } from "lucide-react";
import { UserSplitData } from "@/types/expenses";

interface SplitSummaryCollapsibleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  splitData: UserSplitData[];
  selectedUsers: Record<string, boolean>;
  getUserName: (userData: UserSplitData) => string;
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
  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
          <h4 className="text-base font-medium">Show payment breakdown</h4>
          <div className="flex items-center text-muted-foreground">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="text-sm space-y-2">
              {splitData
                .filter(data => selectedUsers[data.userId] !== false)
                .map((userData) => {
                  const amount = getCalculatedAmount(userData);
                  return (
                    <div key={userData.userId} className="flex justify-between">
                      <span>{getUserName(userData)}</span>
                      <span className="font-medium">{amount.toFixed(2)}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SplitSummaryCollapsible;
