
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import ExpenseFormSubmitButton from './ExpenseFormSubmitButton';

interface ExpenseFormFooterProps {
  navigate: NavigateFunction;
  submitLoading: boolean;
  isEditing: boolean;
  isFormValid: boolean;
  onSubmit: () => void;
}

const ExpenseFormFooter: React.FC<ExpenseFormFooterProps> = ({
  navigate,
  submitLoading,
  isEditing,
  isFormValid,
  onSubmit
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t p-4 z-10">
      <div className="container mx-auto flex justify-between">
        <button 
          type="button" 
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-gray-700 font-medium"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <ExpenseFormSubmitButton 
          loading={submitLoading} 
          isEditing={isEditing} 
          disabled={!isFormValid}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
};

export default ExpenseFormFooter;
