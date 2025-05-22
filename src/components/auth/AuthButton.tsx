
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, LogIn } from 'lucide-react';

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
  return (
    <Button 
      onClick={onClick} 
      className="w-full"
      size="lg"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loginAttempts > 0 ? `${loadingText} (${loginAttempts})...` : `${loadingText}...`}
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          {actionText}
        </>
      )}
    </Button>
  );
};

export default AuthButton;
