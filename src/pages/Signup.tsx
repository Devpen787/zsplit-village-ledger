
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Wallet, Loader2, AlertCircle } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { login, authenticated, ready } = usePrivy();
  const { isAuthenticated, refreshUser, loading, authError, clearAuthError, loginAttempts } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const loginTimeoutRef = useRef<number | null>(null);
  
  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearAuthError();
    return () => {
      clearAuthError();
      // Clear any pending timeouts
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
    };
  }, [clearAuthError]);
  
  // Handle navigation if already authenticated
  useEffect(() => {
    let isActive = true;
    
    const checkAuthentication = async () => {
      if (ready && authenticated) {
        if (isActive) setIsLoading(true);
        console.log('Privy authenticated, refreshing user profile');
        
        try {
          const user = await refreshUser();
          
          if (user && isActive) {
            console.log('User profile refreshed, navigating to dashboard');
            navigate('/', { replace: true });
          } else if (isActive) {
            console.log('Failed to refresh user profile');
            setLocalError("Failed to create your profile. Please try again.");
            setIsLoading(false);
            
            // If we've tried multiple times and still failing, show more helpful error
            if (loginAttempts > 2) {
              setLocalError("Persistent signup issues. Please try refreshing the page or clearing your browser cache.");
            }
          }
        } catch (error) {
          if (isActive) {
            console.error('Error refreshing user profile:', error);
            setLocalError("Authentication error. Please try again later.");
            setIsLoading(false);
          }
        }
      } else if (ready && !authenticated && isActive) {
        // Reset loading state if not authenticated
        setIsLoading(false);
      }
    };
    
    checkAuthentication();
    
    return () => {
      isActive = false;
    };
  }, [ready, authenticated, navigate, refreshUser, loginAttempts]);

  // Redirect if authenticated through our context
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    setIsLoading(true);
    setLocalError(null);
    clearAuthError();
    
    try {
      login();
      
      // Add a timeout to reset loading state if Privy doesn't redirect or fails silently
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      loginTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setLocalError("Signup timed out. Please try again.");
      }, 10000); // 10 seconds timeout
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      setLocalError("Failed to initiate signup. Please try again.");
      toast.error("Signup failed. Please try again.");
    }
  };

  // Determine which error to display (local or from auth context)
  const displayError = localError || authError;
  
  // Determine if button should be in loading state
  const showLoadingButton = isLoading || loading;

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Zsplit</CardTitle>
          <CardDescription>
            Sign in with email or wallet to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-center justify-center gap-4">
            <Button 
              onClick={handleLogin} 
              className="w-full"
              size="lg"
              disabled={showLoadingButton}
            >
              {showLoadingButton ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign Up
            </Button>
            
            <div className="flex items-center w-full">
              <div className="flex-grow h-px bg-muted"></div>
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-grow h-px bg-muted"></div>
            </div>
            
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline"
              className="w-full"
              disabled={showLoadingButton}
            >
              Already have an account? Log in
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mt-4">
              <Wallet className="inline mr-1 h-3 w-3" />
              Connect your wallet for Web3 features
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
