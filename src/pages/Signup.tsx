
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from "@/contexts"; // Updated import
import { clearAuthState } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Wallet, Loader2, AlertCircle } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { login, authenticated, ready } = usePrivy();
  const { isAuthenticated, refreshUser, loading: authLoading, authError, clearAuthError, loginAttempts, resetLoginAttempts } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const loginTimeoutRef = useRef<number | null>(null);
  const maxRetries = useRef(3);
  const retryCount = useRef(0);
  
  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearAuthError();
    resetLoginAttempts();
    
    return () => {
      clearAuthError();
      // Clear any pending timeouts
      if (loginTimeoutRef.current) {
        window.clearTimeout(loginTimeoutRef.current);
      }
    };
  }, [clearAuthError, resetLoginAttempts]);
  
  // Handle Privy authentication state changes
  useEffect(() => {
    let isActive = true;
    
    const checkAuthentication = async () => {
      if (ready && authenticated) {
        if (isActive) setIsLoading(true);
        console.log('Privy authenticated, refreshing user profile');
        
        try {
          // Try to refresh user profile with retry logic
          const retryRefreshUser = async () => {
            try {
              // Clean up any previous auth state
              if (retryCount.current === 0) {
                clearAuthState();
              }
              
              const user = await refreshUser();
              
              if (user && isActive) {
                console.log('User profile refreshed, navigating to dashboard');
                navigate('/', { replace: true });
              } else if (isActive) {
                // Only retry if we haven't exceeded the maximum number of retries
                if (retryCount.current < maxRetries.current) {
                  retryCount.current++;
                  console.log(`Failed to refresh user profile, retrying (${retryCount.current}/${maxRetries.current})...`);
                  
                  // Add a delay before retrying
                  loginTimeoutRef.current = window.setTimeout(() => {
                    retryRefreshUser();
                  }, 1000); // 1 second delay between retries
                } else {
                  console.error('Failed to refresh user profile after maximum retries');
                  setLocalError("Failed to create your profile after multiple attempts. Please try again.");
                  setIsLoading(false);
                }
              }
            } catch (error) {
              if (!isActive) return;
              
              console.error('Error in retry refresh:', error);
              if (retryCount.current < maxRetries.current) {
                retryCount.current++;
                loginTimeoutRef.current = window.setTimeout(retryRefreshUser, 1000);
              } else {
                setLocalError("Authentication error after multiple attempts. Please try again later.");
                setIsLoading(false);
              }
            }
          };
          
          retryRefreshUser();
          
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
    retryCount.current = 0;
    
    // Clean up any existing auth state
    clearAuthState();
    
    try {
      login();
      
      // Add a timeout to reset loading state if Privy doesn't redirect or fails silently
      if (loginTimeoutRef.current) {
        window.clearTimeout(loginTimeoutRef.current);
      }
      
      loginTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setLocalError("Signup timed out. Please try again.");
      }, 15000); // 15 seconds timeout
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
  const showLoadingButton = isLoading || authLoading || (authenticated && !isAuthenticated);

  // Get a more user-friendly error message
  const getUserFriendlyErrorMessage = (errorMsg: string | null) => {
    if (!errorMsg) return null;
    
    if (errorMsg.includes('row-level security policy')) {
      return "Authentication error: Unable to create your profile due to security policies. We need to adjust the RLS policies in Supabase to allow new user registration.";
    }
    
    if (errorMsg.includes('permission denied')) {
      return "Permission denied: You don't have access to create a profile. Please contact support.";
    }
    
    return errorMsg;
  };

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
              <AlertDescription>{getUserFriendlyErrorMessage(displayError)}</AlertDescription>
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loginAttempts > 0 ? `Creating account (${loginAttempts})...` : 'Creating account...'}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign Up
                </>
              )}
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
          
          {loginAttempts > 2 && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Having trouble signing up? Try these steps:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Refresh this page</li>
                <li>Clear your browser cache</li>
                <li>Try a different browser</li>
              </ul>
              
              <Alert variant="warning" className="mt-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  For developers: This error may be due to Supabase RLS policies not allowing new user creation. 
                  Update the policy to allow inserts for non-authenticated users or use a service role key.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
