
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
  const { isAuthenticated, refreshUser, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Handle navigation if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      setIsLoading(true);
      console.log('Privy authenticated, refreshing user profile');
      refreshUser().then((user) => {
        if (user) {
          console.log('User profile refreshed, navigating to dashboard or stored path');
          // Use stored path or default to home page
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          console.log('Failed to refresh user profile');
          setAuthError("Failed to load your profile. Please try again.");
          setIsLoading(false);
        }
      }).catch(error => {
        console.error('Error refreshing user profile:', error);
        setAuthError("Authentication error. Please try again later.");
        setIsLoading(false);
      });
    }
  }, [ready, authenticated, navigate, refreshUser, location]);

  // Redirect if authenticated through our context
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      login();
      // The privy login will redirect, so we don't need to handle success here
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      setAuthError("Failed to initiate login. Please try again.");
      toast.error("Login failed. Please try again.");
    }
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
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-center justify-center gap-4">
            <Button 
              onClick={handleLogin} 
              className="w-full"
              size="lg"
              disabled={isLoading || authLoading}
            >
              {(isLoading || authLoading) ? (
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
