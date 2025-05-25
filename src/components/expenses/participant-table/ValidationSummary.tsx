
import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ValidationSummaryProps {
  splitMethod: string;
  totalAmount: number;
  validation: {
    isValid: boolean;
    message: string;
  };
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  splitMethod,
  totalAmount,
  validation
}) => {
  if (splitMethod === 'equal') return null;

  const getValidationContent = () => {
    if (splitMethod === 'amount') {
      return {
        validText: `Amounts add up to ${totalAmount.toFixed(2)}`,
        validTooltip: 'All participant amounts total correctly',
        invalidTooltip: 'Adjust amounts to match the total expense amount'
      };
    }
    
    if (splitMethod === 'percentage') {
      return {
        validText: 'Percentages add up to 100%',
        validTooltip: 'All percentages total to exactly 100%',
        invalidTooltip: 'Adjust percentages so they total 100%'
      };
    }
    
    return null;
  };

  const content = getValidationContent();
  if (!content) return null;

  return (
    <TooltipProvider>
      <div className={cn(
        "text-sm mb-4 flex items-center p-2 rounded-md",
        validation.isValid ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
      )}>
        {validation.isValid ? (
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              {content.validText}
            </TooltipTrigger>
            <TooltipContent>
              <p>{content.validTooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {validation.message}
            </TooltipTrigger>
            <TooltipContent>
              <p>{content.invalidTooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
