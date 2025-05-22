
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ExpenseFormHeaderProps {
  isEditing: boolean;
  groupName?: string | null;
}

const ExpenseFormHeader: React.FC<ExpenseFormHeaderProps> = ({ isEditing, groupName }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h2 className="text-2xl font-bold mb-2">{isEditing ? "Edit Expense" : "New Expense"}</h2>
      {groupName && (
        <p className="text-muted-foreground mb-4">
          You're adding an expense to: <span className="font-medium">{groupName}</span>
        </p>
      )}
    </>
  );
};

export default ExpenseFormHeader;
