
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';

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
      // try to refresh the user profile
      refreshUser();
    } else {
      // If we're not authenticated with Privy, try to login again
      login();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
          
          {authError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{authError}</AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryAuth} 
                className="mt-2 w-full"
              >
                Retry Authentication
              </Button>
            </Alert>
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
            </div>
          )}
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
