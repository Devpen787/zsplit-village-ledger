
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton = ({ 
  loading, 
  loadingText, 
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) => {
  return (
    <Button 
      disabled={loading || disabled} 
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};
