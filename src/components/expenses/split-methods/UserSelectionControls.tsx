
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Users } from "lucide-react";

interface UserSelectionControlsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectGroup: () => void;
  groupId?: string | null;
}

const UserSelectionControls: React.FC<UserSelectionControlsProps> = ({
  onSelectAll,
  onDeselectAll,
  onSelectGroup,
  groupId
}) => {
  return (
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
  );
};

export default UserSelectionControls;
