
import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Users } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email?: string | null;
  display_name?: string | null;
  group_id?: string | null;
};

interface ExpenseParticipantsSelectorProps {
  users: User[];
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
  paidBy?: string;
  groupId?: string | null;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectGroup: () => void;
  formatUserName: (user: User) => string;
}

const ExpenseParticipantsSelector: React.FC<ExpenseParticipantsSelectorProps> = ({
  users,
  selectedUsers,
  toggleUser,
  paidBy,
  groupId,
  onSelectAll,
  onDeselectAll,
  onSelectGroup,
  formatUserName
}) => {
  return (
    <div className="space-y-2">
      <Label>Split with</Label>
      
      {/* Bulk selection controls */}
      <div className="flex flex-wrap gap-2 mb-2">
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={onSelectAll}
          className="flex items-center"
        >
          <UserCheck className="h-4 w-4 mr-1" />
          Select All
        </Button>
        
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          onClick={onDeselectAll}
          className="flex items-center"
        >
          <UserX className="h-4 w-4 mr-1" />
          Deselect All
        </Button>
        
        {groupId && (
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={onSelectGroup}
            className="flex items-center"
          >
            <Users className="h-4 w-4 mr-1" />
            Select Group Only
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-2">
          {users.map((user) => {
            const isPayer = user.id === paidBy;
            const formattedName = formatUserName(user);
            
            return (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUsers[user.id] || false}
                  onCheckedChange={() => toggleUser(user.id)}
                />
                <Label 
                  htmlFor={`user-${user.id}`} 
                  className={`cursor-pointer flex items-center ${isPayer ? 'font-medium text-green-600' : ''}`}
                >
                  {formattedName}
                  {isPayer && (
                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      paid
                    </span>
                  )}
                </Label>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseParticipantsSelector;
