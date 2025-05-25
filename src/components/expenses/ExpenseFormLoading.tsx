
import React from 'react';
import { LoadingCenter } from '@/components/ui/loading';

const ExpenseFormLoading: React.FC = () => {
  return (
    <div className="h-64">
      <LoadingCenter />
    </div>
  );
};

export default ExpenseFormLoading;
