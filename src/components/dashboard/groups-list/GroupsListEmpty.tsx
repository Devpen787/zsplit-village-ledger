
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";

interface GroupsListEmptyProps {
  onCreateGroup: () => void;
}

export const GroupsListEmpty = ({ onCreateGroup }: GroupsListEmptyProps) => {
  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <UserPlus className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No Groups Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first group to start tracking shared expenses
        </p>
        <Button onClick={onCreateGroup}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </CardContent>
    </Card>
  );
};
