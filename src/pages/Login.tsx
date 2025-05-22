
import React, { useEffect, useState } from 'react';
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
  const { isAuthenticated, refreshUser, loading: authLoading, authError, clearAuthError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearAuthError();
    return () => clearAuthError();
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
            console.log('User profile refreshed, navigating to dashboard or stored path');
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
          } else if (isActive) {
            console.log('Failed to refresh user profile');
            setLocalError("Failed to load your profile. Please try again.");
            setIsLoading(false);
            
            // If we've tried multiple times and still failing, show more helpful error
            if (loginAttempts > 2) {
              setLocalError("Persistent login issues. Please try refreshing the page or clearing your browser cache.");
            }
            
            setLoginAttempts(prev => prev + 1);
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
  }, [ready, authenticated, navigate, refreshUser, location, loginAttempts]);

  // Redirect if authenticated through our context
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = () => {
    setIsLoading(true);
    setLocalError(null);
    clearAuthError();
    
    try {
      login();
      // The privy login will redirect, so we don't need to handle success here
      // Add a timeout to reset loading state if Privy doesn't redirect
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      setLocalError("Failed to initiate login. Please try again.");
      toast.error("Login failed. Please try again.");
    }
  };

  // Determine which error to display (local or from auth context)
  const displayError = localError || authError;

  // Determine if button should be in loading state
  const showLoadingButton = isLoading || authLoading;

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
              Sign In
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
