
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ExpenseFormHeaderProps {
  isEditing: boolean;
}

const ExpenseFormHeader: React.FC<ExpenseFormHeaderProps> = ({ isEditing }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h2 className="text-2xl font-bold mb-4">{isEditing ? "Edit Expense" : "New Expense"}</h2>
    </>
  );
};

export default ExpenseFormHeader;
