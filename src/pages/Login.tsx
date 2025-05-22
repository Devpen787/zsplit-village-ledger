
import React from 'react';
import AuthContainer from "@/components/auth/AuthContainer";
import AuthButton from "@/components/auth/AuthButton";
import AuthNavLink from "@/components/auth/AuthNavLink";
import { useAuthFlow } from "@/hooks/useAuthFlow";

const Login = () => {
  const { handleAuth, displayError, showLoadingButton, loginAttempts } = useAuthFlow(false);

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
    </AuthContainer>
  );
};

export default Login;
