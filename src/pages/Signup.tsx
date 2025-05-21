
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { LogIn, Wallet, Loader2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { login, authenticated, ready } = usePrivy();
  const { isAuthenticated, refreshUser, loading } = useAuth();
  
  // Handle navigation if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      console.log('Privy authenticated, refreshing user profile');
      refreshUser().then((user) => {
        if (user) {
          console.log('User profile refreshed, navigating to dashboard');
          navigate('/');
        } else {
          console.log('Failed to refresh user profile');
        }
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
    login();
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
          <div className="flex flex-col items-center justify-center gap-4">
            <Button 
              onClick={handleLogin} 
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
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
