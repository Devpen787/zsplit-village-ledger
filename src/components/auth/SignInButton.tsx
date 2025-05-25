
import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading';

export default function SignInButton() {
  const { login } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error("Login error:", error);
    }
    // Note: We don't need to set isLoading back to false here
    // as the page will navigate away on successful login
  };

  return (
    <LoadingButton
      onClick={handleLogin}
      loading={isLoading}
      loadingText="Signing in..."
    >
      <LogIn className="mr-2 h-4 w-4" />
      Sign In
    </LoadingButton>
  );
}
