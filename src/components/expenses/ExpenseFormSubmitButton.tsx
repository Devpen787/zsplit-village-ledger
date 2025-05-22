
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ExpenseFormSubmitButtonProps {
  loading: boolean;
}

const ExpenseFormSubmitButton: React.FC<ExpenseFormSubmitButtonProps> = ({ loading }) => {
  return (
    <Button type="submit" className="w-full" disabled={loading}>
      {loading ? (
        <>
          Adding Expense <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        </>
      ) : (
        "Add Expense"
      )}
    </Button>
  );
};

export default ExpenseFormSubmitButton;
