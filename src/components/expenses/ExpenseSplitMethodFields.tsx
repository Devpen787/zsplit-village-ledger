
import React, { useState } from "react";
import SplitMethodSelector from "./split-methods/SplitMethodSelector";
import SplitInputs from "./split-methods/SplitInputs";
import SplitSummary from "./split-methods/SplitSummary";
import ValidationAlert from "./split-methods/ValidationAlert";
import { UserSplitData } from "@/types/expenses";
import { useExpenseSplit } from "@/hooks/useExpenseSplit";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

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
}

const ExpenseSplitMethodFields: React.FC<ExpenseSplitMethodFieldsProps> = ({
  users,
  splitMethod,
  setSplitMethod,
  totalAmount,
  paidBy,
  onSplitDataChange,
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
      {/* Split Method Selector */}
      <SplitMethodSelector splitMethod={splitMethod} setSplitMethod={setSplitMethod} />
      
      {/* Participant Selection and Split Inputs in one card */}
      <Card>
        <CardContent className="pt-6 pb-4 space-y-6">
          {/* Participant Selection */}
          <div className="space-y-2">
            <Label>Split with</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers[user.id] || false}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                    {user.name || user.email}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Validation Alert */}
          <ValidationAlert validationError={validationError} />
          
          {/* Split Inputs */}
          {filteredUsers.length > 0 ? (
            <SplitInputs
              splitMethod={splitMethod}
              splitData={splitData}
              users={filteredUsers}
              totalAmount={totalAmount}
              paidBy={paidBy}
              onInputChange={handleInputChange}
              adjustShares={adjustShares}
              getCalculatedAmount={getCalculatedAmount}
              getTotalShares={getTotalShares}
            />
          ) : (
            <div className="text-amber-500 text-center py-2">
              Please select at least one participant to split the expense with.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Collapsible Summary - only show if we have a valid amount */}
      {totalAmount > 0 && filteredUsers.length > 0 && (
        <Card className="overflow-hidden">
          <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <h4 className="text-base font-medium">Payment Summary</h4>
              <div className="flex items-center text-muted-foreground">
                {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <SplitSummary 
                  splitData={splitData}
                  totalAmount={totalAmount}
                  paidBy={paidBy}
                  getCalculatedAmount={getCalculatedAmount}
                  getUserName={getUserName}
                  splitMethod={splitMethod}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
};

export default ExpenseSplitMethodFields;
