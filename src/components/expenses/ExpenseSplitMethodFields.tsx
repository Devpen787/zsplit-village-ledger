import React, { useState, useEffect } from "react";
import SplitMethodSelector from "./split-methods/SplitMethodSelector";
import SplitSummary from "./split-methods/SplitSummary";
import ValidationAlert from "./split-methods/ValidationAlert";
import { UserSplitData, ExpenseUser } from "@/types/expenses";
import { useExpenseSplit } from "@/hooks/useExpenseSplit";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import ExpenseParticipantsSelector from "./ExpenseParticipantsSelector";

interface ExpenseSplitMethodFieldsProps {
  users: ExpenseUser[];
  splitMethod: string;
  setSplitMethod: (value: string) => void;
  totalAmount: number;
  paidBy: string;
  onSplitDataChange: (splitData: UserSplitData[]) => void;
  groupName?: string | null;
  groupId?: string | null;
}

const ExpenseSplitMethodFields: React.FC<ExpenseSplitMethodFieldsProps> = ({
  users,
  splitMethod,
  setSplitMethod,
  totalAmount,
  paidBy,
  onSplitDataChange,
  groupName,
  groupId
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
  
  // Mark users with their active status for split calculations
  const usersWithActiveStatus = users.map(user => ({
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
    users: usersWithActiveStatus,
    totalAmount,
    paidBy,
    splitMethod,
    onSplitDataChange
  });
  
  // Toggle a single user's selection status
  const toggleUser = (userId: string) => {
    // Never deselect the user who paid
    if (userId === paidBy) return;
    
    // Update the local selected users state
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    
    // Also update the active status in the split data
    toggleUserActive(userId, !selectedUsers[userId]);
  };

  // Format user names with proper fallback logic
  const formatUserName = (user: ExpenseUser): string => {
    // First priority: display_name if available
    if (user.display_name) return user.display_name;
    
    // Second priority: use email prefix (before @)
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix;
    }
    
    // Third priority: use name if available
    if (user.name) return user.name;
    
    // Last resort: truncated user ID
    return user.id.substring(0, 8) + '...';
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    const newSelectedUsers = { ...selectedUsers };
    users.forEach(user => {
      newSelectedUsers[user.id] = true;
    });
    setSelectedUsers(newSelectedUsers);
    
    // Update all users as active in the split data
    users.forEach(user => {
      toggleUserActive(user.id, true);
    });
  };
  
  const handleDeselectAll = () => {
    const newSelectedUsers = { ...selectedUsers };
    
    // Keep the payer selected
    users.forEach(user => {
      newSelectedUsers[user.id] = (user.id === paidBy);
    });
    setSelectedUsers(newSelectedUsers);
    
    // Update all non-payer users as inactive
    users.forEach(user => {
      if (user.id !== paidBy) {
        toggleUserActive(user.id, false);
      }
    });
  };
  
  const handleSelectGroup = () => {
    if (!groupId) return;
    
    const newSelectedUsers = { ...selectedUsers };
    
    // Always keep the payer selected
    users.forEach(user => {
      // Select only users in the current group or the payer
      const isInGroup = user.group_id === groupId;
      newSelectedUsers[user.id] = isInGroup || user.id === paidBy;
      
      // Update active status in split data
      toggleUserActive(user.id, isInGroup || user.id === paidBy);
    });
    
    setSelectedUsers(newSelectedUsers);
  };
  
  // Sort users - group members first, then alphabetically
  const sortedUsers = [...users].sort((a, b) => {
    // Payer always comes first
    if (a.id === paidBy) return -1;
    if (b.id === paidBy) return 1;
    
    // Group members come before non-members
    const aInGroup = a.group_id === groupId;
    const bInGroup = b.group_id === groupId;
    if (aInGroup && !bInGroup) return -1;
    if (!aInGroup && bInGroup) return 1;
    
    // Sort alphabetically by display name or email
    const aName = formatUserName(a).toLowerCase();
    const bName = formatUserName(b).toLowerCase();
    return aName.localeCompare(bName);
  });
  
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
      
      {/* Participant Selection with Bulk Controls */}
      <ExpenseParticipantsSelector
        users={sortedUsers}
        selectedUsers={selectedUsers}
        toggleUser={toggleUser}
        paidBy={paidBy}
        groupId={groupId}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onSelectGroup={handleSelectGroup}
        formatUserName={formatUserName}
      />
      
      {/* Split Summary Table */}
      <Card>
        <CardContent className="pt-4 pb-2 overflow-x-auto">
          <SplitSummary
            splitData={splitData}
            totalAmount={totalAmount}
            paidBy={paidBy}
            getCalculatedAmount={getCalculatedAmount}
            getUserName={(userData) => {
              // If we have user details in the splitData, use them
              if (userData.display_name) return userData.display_name;
              if (userData.email) return userData.email.split('@')[0];
              if (userData.name) return userData.name;
              
              // Otherwise find the user in the users array
              const user = users.find(u => u.id === userData.userId);
              return formatUserName(user || { id: userData.userId, email: null });
            }}
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
      )}
    </div>
  );
};

export default ExpenseSplitMethodFields;
