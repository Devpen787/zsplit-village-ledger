
import React from 'react';
import AuthContainer from "@/components/auth/AuthContainer";
import AuthButton from "@/components/auth/AuthButton";
import AuthNavLink from "@/components/auth/AuthNavLink";
import { Wallet } from "lucide-react";
import { useAuthFlow } from "@/hooks/useAuthFlow";

const Signup = () => {
  const { handleAuth, displayError, showLoadingButton, loginAttempts } = useAuthFlow(true);

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
    </AuthContainer>
  );
};

export default Signup;
