
import React, { useEffect, useState } from 'react';
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
  const { isAuthenticated, refreshUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Handle navigation if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      setIsLoading(true);
      console.log('Privy authenticated, refreshing user profile');
      refreshUser().then((user) => {
        if (user) {
          console.log('User profile refreshed, navigating to dashboard');
          navigate('/');
        } else {
          console.log('Failed to refresh user profile');
          setAuthError("Failed to create your profile. Please try again.");
          setIsLoading(false);
        }
      }).catch(error => {
        console.error('Error refreshing user profile:', error);
        setAuthError("Authentication error. Please try again later.");
        setIsLoading(false);
      });
    }
  }, [ready, authenticated, navigate, refreshUser]);

  // Redirect if authenticated through our context
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      login();
      // The privy login will redirect, so we don't need to handle success here
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      setAuthError("Failed to initiate signup. Please try again.");
      toast.error("Signup failed. Please try again.");
    }
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
              disabled={loading || isLoading}
            >
              {loading || isLoading ? (
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
