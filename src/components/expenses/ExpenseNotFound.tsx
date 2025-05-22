
import React from 'react';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ExpenseNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardContent className="p-6 space-y-4">
          <CardTitle>Expense Not Found</CardTitle>
          <CardDescription>The requested expense could not be found.</CardDescription>
          <Button onClick={() => navigate('/')} className="mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
