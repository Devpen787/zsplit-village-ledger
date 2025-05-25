
import React from 'react';
import { Info } from 'lucide-react';

interface SplitMethodHelpTextProps {
  splitMethod: string;
}

export const SplitMethodHelpText: React.FC<SplitMethodHelpTextProps> = ({ splitMethod }) => {
  const getHelpText = () => {
    switch (splitMethod) {
      case 'equal':
        return 'All selected participants will pay the same amount';
      case 'amount':
        return 'Specify exact amounts for each participant';
      case 'percentage':
        return 'Percentages must add up to 100%';
      default:
        return null;
    }
  };

  const helpText = getHelpText();
  
  if (!helpText) return null;

  return (
    <div className="text-sm text-muted-foreground flex items-center mb-2">
      <Info size={14} className="mr-1" />
      {helpText}
    </div>
  );
};
