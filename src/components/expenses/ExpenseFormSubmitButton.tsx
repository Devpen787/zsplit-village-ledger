
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ExpenseFormSubmitButtonProps {
  loading: boolean;
  isEditing: boolean;
  disabled?: boolean;
}

const ExpenseFormSubmitButton: React.FC<ExpenseFormSubmitButtonProps> = ({ 
  loading, 
  isEditing, 
  disabled = false 
}) => {
  return (
    <div>
      <Button type="submit" disabled={loading || disabled}>
        {loading ? (
          <>
            {isEditing ? "Updating..." : "Saving..."}
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          isEditing ? "Update Expense" : "Save Expense"
        )}
      </Button>
    </div>
  );
};

export default ExpenseFormSubmitButton;
