
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ExpenseFormHeader: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add Expense</h1>
    </>
  );
};

export default ExpenseFormHeader;
