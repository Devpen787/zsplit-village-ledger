
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ExpensesList } from '@/components/ExpensesList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';

const Index = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {user?.name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Track and manage your shared expenses
            </p>
          </div>
          <Button asChild>
            <Link to="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              New Expense
            </Link>
          </Button>
        </div>

        <ExpensesList />
      </div>
    </AppLayout>
  );
};

export default Index;
