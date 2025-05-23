
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useNavigate } from 'react-router-dom';
import { expenseFormSchema, useExpenseForm, ExpenseFormValues } from '@/hooks/useExpenseForm';
import ExpenseFormFields from './ExpenseFormFields';
import ExpenseFormHeader from './ExpenseFormHeader';
import ExpenseFormSubmitButton from './ExpenseFormSubmitButton';
import { UnifiedParticipantTable } from './participant-table';
import ExpenseFormFooter from './ExpenseFormFooter';
import ExpenseFormLoading from './ExpenseFormLoading';

interface ExpenseFormProps {
  groupId: string | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ groupId }) => {
  const navigate = useNavigate();
  const {
    loading,
    submitLoading,
    getDefaultValues,
    onSubmit,
    users,
    isEditing,
    groupName
  } = useExpenseForm(groupId);

  const [splitMethod, setSplitMethod] = useState<string>("equal");
  const [isSplitValid, setIsSplitValid] = useState<boolean>(true);
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Track form validity separately from React Hook Form
  const isFormValid = form.formState.isValid && isSplitValid;

  // Initialize splitData with all users
  const [splitData, setSplitData] = useState<any[]>(
    users?.map(user => ({
      userId: user.id,
      isActive: true,
    })) || []
  );

  // Update split data when users change
  React.useEffect(() => {
    if (users && users.length > 0) {
      setSplitData(prevSplitData => {
        // Keep existing users' data and add new users
        const existingUserIds = prevSplitData.map(data => data.userId);
        const newSplitData = [...prevSplitData];
        
        users.forEach(user => {
          if (!existingUserIds.includes(user.id)) {
            newSplitData.push({
              userId: user.id,
              isActive: true,
            });
          }
        });
        
        return newSplitData;
      });
    }
  }, [users]);

  // Handle split data changes from the unified table
  const handleSplitDataChange = (newSplitData: any[]) => {
    setSplitData(newSplitData);
    form.setValue('splitData', newSplitData);
    
    // Check if the split data is valid based on the validation
    let isValid = true;
    
    if (splitMethod === 'amount') {
      const activeUsers = newSplitData.filter(data => data.isActive !== false);
      const totalAssigned = activeUsers.reduce((sum, item) => sum + (item.amount || 0), 0);
      isValid = Math.abs(form.watch('amount') - totalAssigned) < 0.01;
    } else if (splitMethod === 'percentage') {
      const activeUsers = newSplitData.filter(data => data.isActive !== false);
      const totalPercentage = activeUsers.reduce((sum, item) => sum + (item.percentage || 0), 0);
      isValid = Math.abs(100 - totalPercentage) < 0.1;
    }
    
    setIsSplitValid(isValid);
  };

  if (loading) {
    return <ExpenseFormLoading />;
  }

  return (
    <div className="container mx-auto py-6 pb-24">
      <ExpenseFormHeader isEditing={isEditing} groupName={groupName} />
      
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Form fields */}
              <ExpenseFormFields 
                form={form} 
                users={users}
                onSplitMethodChange={setSplitMethod} 
              />
              
              {/* Unified Participant Table */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Split with participants</h3>
                <UnifiedParticipantTable
                  users={users || []}
                  splitData={splitData}
                  splitMethod={splitMethod}
                  totalAmount={form.watch('amount') || 0}
                  onSplitDataChange={handleSplitDataChange}
                  paidBy={form.watch('paidBy') || ''}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <ExpenseFormFooter 
        navigate={navigate}
        submitLoading={submitLoading}
        isEditing={isEditing}
        isFormValid={isFormValid}
        onSubmit={() => form.handleSubmit(onSubmit)()}
      />
    </div>
  );
};

export default ExpenseForm;
