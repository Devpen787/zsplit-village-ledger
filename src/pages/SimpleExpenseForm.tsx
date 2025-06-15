
import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import { SimpleExpenseForm } from '@/components/expenses/SimpleExpenseForm';
import { useSearchParams } from 'react-router-dom';

const SimpleExpenseFormPage = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  return (
    <AppLayout>
      <SimpleExpenseForm groupId={groupId} />
    </AppLayout>
  );
};

export default SimpleExpenseFormPage;
