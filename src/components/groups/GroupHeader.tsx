
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Settings } from "lucide-react";

interface GroupHeaderProps {
  groupName: string;
  groupIcon: string;
  isAdmin: boolean;
  onCreateExpense: () => void;
}

export const GroupHeader = ({ groupName, groupIcon, isAdmin, onCreateExpense }: GroupHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-2xl">
          {groupIcon}
        </div>
        <h1 className="text-2xl font-semibold">{groupName}</h1>
      </div>
      <div className="flex space-x-2">
        {isAdmin && (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
        <Button onClick={onCreateExpense}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>
    </div>
  );
};
