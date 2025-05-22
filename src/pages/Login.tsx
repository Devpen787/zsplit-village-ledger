
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      // Only proceed if Privy is ready and authenticated
      if (ready && authenticated) {
        if (!isActive) return;
        
        console.log('Privy authenticated, refreshing user profile');
        setIsLoading(true);
        
        try {
          // Try to refresh user profile with retry logic
          const retryRefreshUser = async () => {
            try {
              const user = await refreshUser();
              
              if (user && isActive) {
                console.log('User profile refreshed, navigating to dashboard or stored path');
                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
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
                  setLocalError("Failed to create your profile after multiple attempts. Please try signing out and in again.");
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
          if (!isActive) return;
          
          console.error('Error refreshing user profile:', error);
          setLocalError("Authentication error. Please try again later.");
          setIsLoading(false);
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
  }, [ready, authenticated, navigate, refreshUser, location]);

  // Redirect if authenticated through our context
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle manual login click
  const handleLogin = () => {
    setIsLoading(true);
    setLocalError(null);
    clearAuthError();
    retryCount.current = 0;
    
    try {
      login();
      
      // Add a global timeout to reset loading state if Privy doesn't redirect or fails silently
      if (loginTimeoutRef.current) {
        window.clearTimeout(loginTimeoutRef.current);
      }
      
      loginTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setLocalError("Login timed out. Please try again.");
      }, 15000); // 15 seconds timeout
      
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      setLocalError("Failed to initiate login. Please try again.");
      toast.error("Login failed. Please try again.");
    }
  };

  // Determine which error to display (local or from auth context)
  const displayError = localError || authError;

  // Determine if button should be in loading state - prevent blinking by checking all states
  const showLoadingButton = isLoading || authLoading || (authenticated && !isAuthenticated);

  // Get a more user-friendly error message
  const getUserFriendlyErrorMessage = (errorMsg: string | null) => {
    if (!errorMsg) return null;
    
    if (errorMsg.includes('row-level security policy')) {
      return "Authentication error: Unable to access your profile due to security policies. Please try signing out and in again.";
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
          <CardTitle className="text-2xl">Log In to Zsplit</CardTitle>
          <CardDescription>
            Continue with email or wallet
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
                  {loginAttempts > 0 ? `Trying to sign in (${loginAttempts})...` : 'Signing in...'}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
            
            <div className="flex items-center w-full">
              <div className="flex-grow h-px bg-muted"></div>
              <span className="px-4 text-sm text-muted-foreground">or</span>
              <div className="flex-grow h-px bg-muted"></div>
            </div>
            
            <Button 
              onClick={() => navigate('/signup')} 
              variant="outline"
              className="w-full"
              disabled={showLoadingButton}
            >
              Need an account? Sign up
            </Button>
          </div>
          
          {loginAttempts > 2 && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Having trouble signing in? Try these steps:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Refresh this page</li>
                <li>Clear your browser cache</li>
                <li>Try a different browser</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
