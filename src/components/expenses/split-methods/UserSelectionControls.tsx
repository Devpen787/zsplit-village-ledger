
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Users } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface UserSelectionControlsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectGroup: (groupId: string) => void;
  groupId?: string | null;
  availableGroups?: Record<string, string>;
}

const UserSelectionControls: React.FC<UserSelectionControlsProps> = ({
  onSelectAll,
  onDeselectAll,
  onSelectGroup,
  groupId,
  availableGroups = {}
}) => {
  const hasGroups = Object.keys(availableGroups).length > 0;
  
  return (
    <div className="flex flex-wrap gap-2">
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
      
      {(hasGroups || groupId) && (
        <Select onValueChange={onSelectGroup}>
          <SelectTrigger className="h-9 w-auto">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <SelectValue placeholder="Select Group" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.keys(availableGroups).map(groupId => (
                <SelectItem key={groupId} value={groupId}>
                  Group: {groupId.substring(0, 8)}...
                </SelectItem>
              ))}
              {groupId && !availableGroups[groupId] && (
                <SelectItem value={groupId}>
                  Current Group
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default UserSelectionControls;
