
import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type User = {
  id: string;
  name: string | null;
};

interface ExpenseParticipantsSelectorProps {
  users: User[];
  selectedUsers: Record<string, boolean>;
  toggleUser: (userId: string) => void;
}

const ExpenseParticipantsSelector: React.FC<ExpenseParticipantsSelectorProps> = ({
  users,
  selectedUsers,
  toggleUser,
}) => {
  return (
    <div className="space-y-2">
      <Label>Split with</Label>
      <Card>
        <CardContent className="p-4 space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center space-x-2">
              <Checkbox
                id={`user-${user.id}`}
                checked={selectedUsers[user.id] || false}
                onCheckedChange={() => toggleUser(user.id)}
              />
              <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                {user.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseParticipantsSelector;
