
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/contexts';
import { useExpenseUsers } from '@/hooks/useExpenseUsers';
import { useExpenseDetail } from '@/hooks/useExpenseDetail';
import { ExpenseDetailLoading } from '@/components/expenses/ExpenseDetailLoading';
import { ExpenseNotFound } from '@/components/expenses/ExpenseNotFound';
import { ExpenseDetailView } from '@/components/expenses/ExpenseDetailView';
import { ExpenseDetailEdit } from '@/components/expenses/ExpenseDetailEdit';

const ExpenseDetail = () => {
  const { id } = useParams<{ id: string }>();
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
    return <ExpenseDetailLoading />;
  }

  if (!expense) {
    return <ExpenseNotFound />;
  }

  return (
    <div className="container mx-auto py-10">
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
  );
};

export default ExpenseDetail;
