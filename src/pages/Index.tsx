import React from 'react';
import { ExpensesList } from "@/components/ExpensesList";
import AppLayout from "@/layouts/AppLayout";
import { InviteUserModal } from "@/components/InviteUserModal";
import { useAuth } from '@/contexts'; // Updated import

const Index = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-4">
          Dashboard
        </h1>
        
        {user && (
          <div className="mb-4">
            <p>
              Welcome, {user.name || user.email}!
            </p>
          </div>
        )}

        <InviteUserModal onUserAdded={() => {}} />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Recent Expenses
          </h2>
          <ExpensesList limit={5} />
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;

