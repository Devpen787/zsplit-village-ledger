
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

type ExpenseMember = {
  id: string;
  name: string;
  shareAmount: number;
  paidStatus: boolean;
};

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();

  // This will be replaced with real data from Supabase once integrated
  const mockExpense = {
    id: "1",
    title: "Groceries",
    amount: 87.35,
    currency: "CHF",
    date: "2025-05-20",
    paidBy: "Anna",
    splitMethod: "Equal",
    notes: "Weekly grocery shopping including vegetables, bread, and milk.",
    members: [
      { id: "1", name: "Anna", shareAmount: 21.84, paidStatus: true },
      { id: "2", name: "Michael", shareAmount: 21.84, paidStatus: false },
      { id: "3", name: "Sarah", shareAmount: 21.84, paidStatus: false },
      { id: "4", name: "Thomas", shareAmount: 21.83, paidStatus: false },
    ],
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{mockExpense.title}</h1>
        <p className="text-muted-foreground">
          {new Date(mockExpense.date).toLocaleDateString()}
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total amount</span>
              <span className="font-bold">
                {mockExpense.amount.toFixed(2)} {mockExpense.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid by</span>
              <span>{mockExpense.paidBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Split method</span>
              <span>{mockExpense.splitMethod}</span>
            </div>
            {mockExpense.notes && (
              <div className="pt-2 border-t border-border">
                <span className="block text-sm text-muted-foreground mb-1">Notes</span>
                <p className="text-sm">{mockExpense.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-medium mb-3">Who owes what</h2>

      <div className="space-y-3 mb-6">
        {mockExpense.members.map((member) => (
          <Card key={member.id} className={member.paidStatus ? "bg-secondary/50" : ""}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{member.name}</span>
                <span className={`font-medium ${member.paidStatus ? "text-green-600" : ""}`}>
                  {member.shareAmount.toFixed(2)} {mockExpense.currency}
                  {member.paidStatus && " (Paid)"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline">Delete</Button>
        <Button>Mark all as paid</Button>
      </div>
    </div>
  );
};

export default ExpenseDetail;
