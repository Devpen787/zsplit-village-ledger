
import React from "react";

interface GroupContextProps {
  groupName: string | null | undefined;
}

const GroupContext: React.FC<GroupContextProps> = ({ groupName }) => {
  if (!groupName) return null;
  
  return (
    <div className="text-sm text-muted-foreground">
      You're adding an expense to: <span className="font-medium">{groupName}</span>
    </div>
  );
};

export default GroupContext;
