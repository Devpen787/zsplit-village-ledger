
import React, { useState } from "react";
import SplitMethodSelector from "./split-methods/SplitMethodSelector";
import SplitSummary from "./split-methods/SplitSummary";
import ValidationAlert from "./split-methods/ValidationAlert";
import { UserSplitData } from "@/types/expenses";
import { useExpenseSplit } from "@/hooks/useExpenseSplit";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

type User = {
  id: string;
  name?: string | null;
  email: string | null;
};

interface ExpenseSplitMethodFieldsProps {
  users: User[];
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  totalAmount: number;
  paidBy: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  groupName?: string | null;
}

const ExpenseSplitMethodFields: React.FC<ExpenseSplitMethodFieldsProps> = ({
  users,
  splitMethod,
  setSplitMethod,
  totalAmount,
  paidBy,
  onSplitDataChange,
  groupName
}) => {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>(() => {
    // Initialize all users as selected by default
    const initialSelectedUsers: Record<string, boolean> = {};
    users.forEach(user => {
      initialSelectedUsers[user.id] = true;
    });
    return initialSelectedUsers;
  });

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  // Filter users for split calculation
  const filteredUsers = users.filter(user => selectedUsers[user.id] === true);

  const {
    splitData,
    validationError,
    handleInputChange,
    adjustShares,
    getCalculatedAmount,
    getTotalShares,
    getUserName
  } = useExpenseSplit({
    users: filteredUsers,
    totalAmount,
    paidBy,
    splitMethod,
    onSplitDataChange
  });
  
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };
  
  // If no users are selected, show a message
  if (users.length === 0) {
    return (
      <div className="space-y-4">
        <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
        <div className="text-amber-500 text-center p-4">
          Please select at least one participant to split the expense with.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Group Context if provided */}
      {groupName && (
        <div className="text-sm text-muted-foreground">
          You're adding an expense to: <span className="font-medium">{groupName}</span>
        </div>
      )}
      
      {/* Split Method Selector */}
      <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
      
      {/* Validation Alert */}
      <ValidationAlert validationError={validationError} />
      
      {/* Consolidated Split Input Table */}
      <div>
        <Label className="mb-2 block">Split with</Label>
        <Card>
          <CardContent className="pt-4 pb-2 overflow-x-auto">
            <SplitSummary
              splitData={splitData}
              totalAmount={totalAmount}
              paidBy={paidBy}
              getCalculatedAmount={getCalculatedAmount}
              getUserName={getUserName}
              splitMethod={splitMethod}
              selectedUsers={selectedUsers}
              toggleUser={toggleUser}
              onInputChange={handleInputChange}
              adjustShares={adjustShares}
            />
          </CardContent>
        </Card>
        
        {/* Equal split info displayed directly */}
        {splitMethod === "equal" && filteredUsers.length > 0 && totalAmount > 0 && (
          <div className="text-sm text-green-600 flex items-center mt-2">
            <Check className="h-4 w-4 mr-2" />
            Each person will pay {(totalAmount / filteredUsers.length).toFixed(2)}
          </div>
        )}
      </div>
      
      {/* Collapsible Summary - only show if we have a valid amount */}
      {totalAmount > 0 && filteredUsers.length > 0 && splitMethod !== "equal" && (
        <Card className="overflow-hidden">
          <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <h4 className="text-base font-medium">Show payment breakdown</h4>
              <div className="flex items-center text-muted-foreground">
                {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <div className="text-sm space-y-2">
                  {filteredUsers.map((user) => {
                    const userData = splitData.find(d => d.userId === user.id);
                    if (!userData) return null;
                    
                    const amount = getCalculatedAmount(userData);
                    return (
                      <div key={user.id} className="flex justify-between">
                        <span>{getUserName(user.id)}</span>
                        <span className="font-medium">{amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
};

export default ExpenseSplitMethodFields;
