
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SignupFormValues } from "@/schemas/authSchemas";
import SignupForm from "@/components/auth/SignupForm";
import { checkEmailExists, registerUser } from "@/services/authService";

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, refreshUser } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check for hash in URL (from auth redirects)
  useEffect(() => {
    if (location.hash && location.hash.includes('access_token')) {
      // Auth redirect detected, wait a bit for Supabase client to process
      setHasRedirected(true);
      setTimeout(() => {
        refreshUser().then(() => {
          toast.success("Email verified! Welcome!");
          navigate('/');
        }).catch(() => {
          toast.error("Failed to load profile after email verification");
        });
      }, 500);
    }
  }, [location.hash, refreshUser, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, hasRedirected]);

  const handleSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(values.email);
      
      if (emailExists) {
        toast.error("This email is already registered");
        setIsLoading(false);
        return;
      }

      await registerUser(values);
      
      // Success! Notify and update auth context
      toast.success("Account created successfully! Check your email to confirm your account.");
      await refreshUser();
      
    } catch (error: any) {
      // Handle errors gracefully
      const errorMessage = error.message || "Something went wrong during signup";
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {location.hash && location.hash.includes('access_token') && (
            <Alert className="mb-4 bg-blue-50">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Processing your authentication... Please wait.
              </AlertDescription>
            </Alert>
          )}
          <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
