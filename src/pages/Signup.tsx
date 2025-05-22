
import React, { useEffect } from 'react';
import AuthContainer from "@/components/auth/AuthContainer";
import AuthButton from "@/components/auth/AuthButton";
import AuthNavLink from "@/components/auth/AuthNavLink";
import { Wallet } from "lucide-react";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Signup = () => {
  const { handleAuth, displayError, showLoadingButton, loginAttempts } = useAuthFlow(true);

  // Display detailed error information in development mode
  const showDebugInfo = process.env.NODE_ENV === 'development' && loginAttempts > 1;

  return (
    <AuthContainer
      title="Welcome to Zsplit"
      description="Sign in with email or wallet to get started"
      error={displayError}
      showTroubleshooting={loginAttempts > 2}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <AuthButton
          onClick={handleAuth}
          isLoading={showLoadingButton}
          loadingText="Creating account"
          actionText="Sign Up"
          loginAttempts={loginAttempts}
        />
        
        <div className="flex items-center w-full">
          <div className="flex-grow h-px bg-muted"></div>
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <div className="flex-grow h-px bg-muted"></div>
        </div>
        
        <AuthNavLink
          to="/login"
          isLoading={showLoadingButton}
          label="Already have an account? Log in"
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mt-4">
          <Wallet className="inline mr-1 h-3 w-3" />
          Connect your wallet for Web3 features
        </p>
      </div>

      {showDebugInfo && (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            Debug Info: Using service role key to create user. Ensure the Supabase RLS policy allows the service role to insert users. Check browser console for detailed logs.
          </AlertDescription>
        </Alert>
      )}
    </AuthContainer>
  );
};

export default Signup;
