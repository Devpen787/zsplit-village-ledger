
import React from 'react';
import { LogIn } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading';

interface AuthButtonProps {
  onClick: () => void;
  isLoading: boolean;
  loadingText: string;
  actionText: string;
  loginAttempts?: number;
}

const AuthButton = ({ 
  onClick, 
  isLoading, 
  loadingText, 
  actionText,
  loginAttempts = 0
}: AuthButtonProps) => {
  const displayText = loginAttempts > 0 ? `${loadingText} (${loginAttempts})` : loadingText;
  
  return (
    <LoadingButton
      onClick={onClick}
      loading={isLoading}
      loadingText={displayText}
      className="w-full"
      size="lg"
    >
      <LogIn className="mr-2 h-4 w-4" />
      {actionText}
    </LoadingButton>
  );
};

export default AuthButton;
