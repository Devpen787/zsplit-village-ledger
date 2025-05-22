
import React, { useEffect } from 'react';
import AuthContainer from "@/components/auth/AuthContainer";
import AuthButton from "@/components/auth/AuthButton";
import AuthNavLink from "@/components/auth/AuthNavLink";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { AlertCircle } from "lucide-react";

const Login = () => {
  const { handleAuth, displayError, showLoadingButton, loginAttempts } = useAuthFlow(false);

  // Display detailed error information in development mode
  const showDebugInfo = process.env.NODE_ENV === 'development' && loginAttempts > 1;

  return (
    <AuthContainer
      title="Log In to Zsplit"
      description="Continue with email or wallet"
      error={displayError}
      showTroubleshooting={loginAttempts > 2}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <AuthButton
          onClick={handleAuth}
          isLoading={showLoadingButton}
          loadingText="Trying to sign in"
          actionText="Sign In"
          loginAttempts={loginAttempts}
        />
        
        <div className="flex items-center w-full">
          <div className="flex-grow h-px bg-muted"></div>
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <div className="flex-grow h-px bg-muted"></div>
        </div>
        
        <AuthNavLink
          to="/signup"
          isLoading={showLoadingButton}
          label="Need an account? Sign up"
        />
      </div>

      {showDebugInfo && (
        <Alert variant="warning" className="mt-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            Debug Info: User authentication is working through Privy, but creating the user record in Supabase may be failing. Check the browser console for detailed error logs.
          </AlertDescription>
        </Alert>
      )}
    </AuthContainer>
  );
};

export default Login;
