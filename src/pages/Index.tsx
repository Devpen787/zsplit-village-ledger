
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { BalanceSummary } from "@/components/BalanceSummary";
import { ExpensesList } from "@/components/ExpensesList";

const Index = () => {
  // This will be replaced with real data from Supabase once integrated
  const mockGroupName = "Zuitzerland House";

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zsplit</h1>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">{mockGroupName}</h2>
        <BalanceSummary />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-medium">Recent Expenses</h3>
          <Link to="/expenses">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>
        <ExpensesList limit={5} />
      </div>

      <div className="fixed bottom-6 right-6">
        <Link to="/expenses/new">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
