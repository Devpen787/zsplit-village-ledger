
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from '@/contexts';
import { useExpenseUsers } from '@/hooks/useExpenseUsers';
import { useExpenseDetail } from '@/hooks/useExpenseDetail';
import { ExpenseDetailLoading } from '@/components/expenses/ExpenseDetailLoading';
import { ExpenseNotFound } from '@/components/expenses/ExpenseNotFound';
import { ExpenseDetailView } from '@/components/expenses/ExpenseDetailView';
import { ExpenseDetailEdit } from '@/components/expenses/ExpenseDetailEdit';
import AppLayout from '@/layouts/AppLayout';

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenseUsers, isLoading: isUsersLoading } = useExpenseUsers();
  
  const {
    expense,
    loading,
    isEditMode,
    editedTitle,
    setEditedTitle,
    editedAmount,
    setEditedAmount,
    editedCurrency,
    setEditedCurrency,
    editedDate,
    setEditedDate,
    editedPaidBy,
    setEditedPaidBy,
    isDeleting,
    isCopying,
    handleEditClick,
    handleCancelEdit,
    handleSaveClick,
    handleDeleteClick,
    handleCopyToClipboard
  } = useExpenseDetail(id);

  if (loading) {
    return (
      <AppLayout>
        <ExpenseDetailLoading />
      </AppLayout>
    );
  }

  if (!expense) {
    return (
      <AppLayout>
        <ExpenseNotFound />
      </AppLayout>
    );
  }

  const goBack = () => {
    if (expense.group_id) {
      navigate(`/group/${expense.group_id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-10">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Expense' : expense.title}</CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the expense details' : 'View and manage expense details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditMode ? (
              <ExpenseDetailEdit
                editedTitle={editedTitle}
                editedAmount={editedAmount}
                editedCurrency={editedCurrency}
                editedDate={editedDate}
                editedPaidBy={editedPaidBy}
                expenseUsers={expenseUsers}
                onTitleChange={setEditedTitle}
                onAmountChange={setEditedAmount}
                onCurrencyChange={setEditedCurrency}
                onDateChange={setEditedDate}
                onPaidByChange={setEditedPaidBy}
                onCancel={handleCancelEdit}
                onSave={handleSaveClick}
                loading={loading}
              />
            ) : (
              <ExpenseDetailView 
                expense={expense}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onCopy={handleCopyToClipboard}
                isDeleting={isDeleting}
                isCopying={isCopying}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExpenseDetail;
