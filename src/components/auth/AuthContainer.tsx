
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthContainerProps {
  title: string;
  description: string;
  error: string | null;
  children: React.ReactNode;
  showTroubleshooting?: boolean;
}

const AuthContainer = ({ 
  title, 
  description, 
  error, 
  children,
  showTroubleshooting = false 
}: AuthContainerProps) => {
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
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{getUserFriendlyErrorMessage(error)}</AlertDescription>
            </Alert>
          )}
          
          {children}
          
          {showTroubleshooting && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Having trouble signing in? Try these steps:</p>
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

export default AuthContainer;
