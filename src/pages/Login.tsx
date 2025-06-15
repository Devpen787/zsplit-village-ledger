
import React from 'react';
import AuthContainer from "@/components/auth/AuthContainer";
import SignInButton from "@/components/auth/SignInButton";
import AuthNavLink from "@/components/auth/AuthNavLink";
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts";

const Login = () => {
  const { authError, loginAttempts } = useAuth();

  // Display detailed error information in development mode
  const showDebugInfo = process.env.NODE_ENV === 'development' && loginAttempts > 1;

  return (
    <AuthContainer
      title="Log In to Zsplit"
      description="Continue with Privy wallet"
      error={authError}
      showTroubleshooting={loginAttempts > 2}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <SignInButton />
        
        <div className="flex items-center w-full">
          <div className="flex-grow h-px bg-muted"></div>
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <div className="flex-grow h-px bg-muted"></div>
        </div>
        
        <AuthNavLink
          to="/signup"
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
