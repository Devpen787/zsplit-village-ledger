
import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/AppLayout';
import ExpenseForm from '@/components/expenses/ExpenseForm';

const ExpenseFormPage = () => {
  const [groupId, setGroupId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const groupIdParam = urlParams.get('groupId');
    if (groupIdParam) {
      setGroupId(groupIdParam);
    }
  }, []);

  return (
    <AppLayout>
      <ExpenseForm groupId={groupId} />
    </AppLayout>
  );
};

export default ExpenseFormPage;
