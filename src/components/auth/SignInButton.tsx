
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { usePrivy } from '@privy-io/react-auth';
import { Loader2, LogIn } from 'lucide-react';

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
    <Button 
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="mr-2 h-4 w-4" />
      )}
      Sign In
    </Button>
  );
}
