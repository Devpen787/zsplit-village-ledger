import React, { useState, useEffect } from "react";
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
  
  // We'll now keep all users in the splitData, but mark some as inactive
  // This is used for the main calculation logic
  const filteredUsers = users.map(user => ({
    ...user,
    isActive: selectedUsers[user.id] !== false
  }));

  const {
    splitData,
    validationError,
    handleInputChange,
    adjustShares,
    getCalculatedAmount,
    getTotalShares,
    getUserName,
    toggleUserActive
  } = useExpenseSplit({
    users: filteredUsers,
    totalAmount,
    paidBy,
    splitMethod,
    onSplitDataChange
  });
  
  const toggleUser = (userId: string) => {
    // Update the local selected users state
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    
    // Also update the active status in the split data
    toggleUserActive(userId, !selectedUsers[userId]);
  };
  
  // If no users are available, show a message
  if (users.length === 0) {
    return (
      <div className="space-y-4">
        <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
        <div className="text-amber-500 text-center p-4">
          Please add participants to your group to split expenses with.
        </div>
      </div>
    );
  }

  // Count how many active users we have
  const activeUserCount = Object.values(selectedUsers).filter(Boolean).length;

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
        {splitMethod === "equal" && activeUserCount > 0 && totalAmount > 0 && (
          <div className="text-sm text-green-600 flex items-center mt-2">
            <Check className="h-4 w-4 mr-2" />
            Each person will pay {(totalAmount / activeUserCount).toFixed(2)}
          </div>
        )}
      </div>
      
      {/* Collapsible Summary - only show if we have a valid amount */}
      {totalAmount > 0 && activeUserCount > 0 && splitMethod !== "equal" && (
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
                  {splitData
                    .filter(data => selectedUsers[data.userId] !== false)
                    .map((userData) => {
                      const amount = getCalculatedAmount(userData);
                      return (
                        <div key={userData.userId} className="flex justify-between">
                          <span>{getUserName(userData.userId)}</span>
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
