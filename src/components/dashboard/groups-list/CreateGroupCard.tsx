
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CreateGroupCardProps {
  onCreateGroup: () => void;
}

export const CreateGroupCard = ({ onCreateGroup }: CreateGroupCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/20 transition-colors border-dashed border-2 border-muted"
      onClick={onCreateGroup}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
        <Plus className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-medium">Create New Group</h3>
      </CardContent>
    </Card>
  );
};
