
import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SimpleExpensesList } from "@/components/SimpleExpensesList";
import { motion } from "framer-motion";

const Expenses = () => {
  const navigate = useNavigate();

  const handleCreateExpense = () => {
    navigate('/expenses/new');
  };

  return (
    <AppLayout>
      <motion.div 
        className="container mx-auto py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Expenses</h1>
              <p className="text-muted-foreground">Track and manage your expenses</p>
            </div>
          </div>
          <Button onClick={handleCreateExpense} className="hidden md:flex">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleExpensesList />
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
};

export default Expenses;
