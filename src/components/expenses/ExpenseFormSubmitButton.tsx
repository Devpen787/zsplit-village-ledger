
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ExpenseFormSubmitButtonProps {
  loading: boolean;
  isEditing: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const ExpenseFormSubmitButton: React.FC<ExpenseFormSubmitButtonProps> = ({ 
  loading, 
  isEditing, 
  disabled = false,
  onClick,
  className
}) => {
  return (
    <Button 
      type={onClick ? "button" : "submit"} 
      disabled={loading || disabled}
      onClick={onClick}
      className={className}
    >
      {loading ? (
        <>
          {isEditing ? "Updating..." : "Saving..."}
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        </>
      ) : (
        isEditing ? "Update Expense" : "Save Expense"
      )}
    </Button>
  );
};

export default ExpenseFormSubmitButton;
