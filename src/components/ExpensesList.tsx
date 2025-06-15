
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/adapters/useExpenses";
import { ExpensesLoading } from "./expenses/ExpensesLoading";
import { ExpensesError } from "./expenses/ExpensesError";
import { ExpensesEmpty } from "./expenses/ExpensesEmpty";
import { ExpensesGroup } from "./expenses/ExpensesGroup";
import { ExpensesListProps } from "@/types/expenses";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";

export const ExpensesList = ({ limit, groupId }: ExpensesListProps) => {
  const navigate = useNavigate();
  const { 
    groupedExpenses, 
    expenses,
    loading, 
    error, 
    hasRecursionError,
    fetchExpenses 
  } = useExpenses(limit, groupId);

  const handleCreateExpense = () => {
    if (groupId) {
      navigate(`/expenses/new?groupId=${groupId}`);
    } else {
      navigate('/expenses/new');
    }
  };

  if (loading) {
    return <ExpensesLoading />;
  }

  if (hasRecursionError || error) {
    return (
      <ExpensesError
        error={error || ""}
        hasRecursionError={hasRecursionError}
        onTryAgain={fetchExpenses}
        onCreateExpense={handleCreateExpense}
      />
    );
  }

  if (expenses.length === 0) {
    return <ExpensesEmpty onCreateExpense={handleCreateExpense} groupContext={!!groupId} />;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedExpenses)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .map(([date, dateExpenses]) => (
          <ExpensesGroup key={date} date={date} expenses={dateExpenses} />
        ))}
        
      <div className="flex justify-center md:hidden mt-6">
        <Button onClick={handleCreateExpense} variant="outline" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Expense
        </Button>
      </div>
    </div>
  );
};
