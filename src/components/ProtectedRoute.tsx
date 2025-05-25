import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { clearAuthState } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LoadingCenter } from '@/components/ui/loading';
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading, authError, clearAuthError, loginAttempts, refreshUser } = useAuth();
  const { authenticated, login } = usePrivy();
  const location = useLocation();

  // Clear auth errors when leaving protected routes
  useEffect(() => {
    return () => clearAuthError();
  }, [clearAuthError]);

  // Check for mismatched auth state
  const handleRetryAuth = async () => {
    if (authenticated) {
      // If Privy thinks we're authenticated but Supabase doesn't
      // try to refresh the user profile after clearing any stale state
      clearAuthState();
      refreshUser();
    } else {
      // If we're not authenticated with Privy, try to login again
      clearAuthState();
      login();
    }
  };

  // If authenticated, render children
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated but still loading, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingCenter 
          size="lg" 
          text="Loading your profile..." 
          className="min-h-screen"
        />
        
        {authError && (
          <div className="flex justify-center px-4 mt-4">
            <div className="max-w-md w-full">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryAuth} 
                className="mt-2 w-full"
              >
                Retry Authentication
              </Button>
            </div>
          </div>
        )}
        
        {loginAttempts > 2 && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Having trouble? Try these steps:</p>
            <ul className="list-disc list-inside mt-2 text-left">
              <li>Refresh this page</li>
              <li>Clear your browser cache</li>
              <li>Try signing in again</li>
            </ul>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/login'} 
              className="mt-4 w-full"
            >
              Return to Login
            </Button>
            
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                For developers: This error may be due to Supabase RLS policies not allowing new user creation. 
                Update the policy to allow inserts for non-authenticated users or use a service role key.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    );
  }

  // If not authenticated and not loading, redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};
