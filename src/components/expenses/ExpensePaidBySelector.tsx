
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type User = {
  id: string;
  name: string | null;
};

interface ExpensePaidBySelectorProps {
  users: User[];
  paidBy: string;
  setPaidBy: (value: string) => void;
  loading: boolean;
}

const ExpensePaidBySelector: React.FC<ExpensePaidBySelectorProps> = ({
  users,
  paidBy,
  setPaidBy,
  loading,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="paidBy">Paid by</Label>
      {loading ? (
        <div className="flex items-center justify-center h-10">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <Select value={paidBy} onValueChange={setPaidBy}>
          <SelectTrigger>
            <SelectValue placeholder="Who paid?" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default ExpensePaidBySelector;
