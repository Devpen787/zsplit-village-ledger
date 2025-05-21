
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SignupFormValues } from "@/schemas/authSchemas";
import SignupForm from "@/components/auth/SignupForm";
import { checkEmailExists, registerUser } from "@/services/authService";

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ArrowRight, CheckCircle, MailIcon } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, refreshUser } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [authProcessed, setAuthProcessed] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  // Check for hash in URL (from auth redirects) or confirmed flag
  useEffect(() => {
    const isConfirmed = searchParams.get('confirmed') === 'true';
    const hasAuthToken = location.hash && location.hash.includes('access_token');
    
    if (hasAuthToken || isConfirmed) {
      // Auth redirect detected, wait a bit for Supabase client to process
      console.log('Auth redirect detected in Signup page');
      setHasRedirected(true);
      setEmailConfirmed(true);
      
      setTimeout(async () => {
        try {
          const user = await refreshUser();
          if (user) {
            toast.success("✅ Email confirmed. Welcome to Zsplit!");
            console.log('Signup: Authentication redirect processed, navigating to dashboard');
            navigate('/');
          } else {
            setAuthProcessed(true);
          }
        } catch (err) {
          console.error('Failed to load profile after email verification', err);
          toast.error("Failed to load profile after email verification");
          setAuthProcessed(true);
        }
      }, 500);
    }
  }, [location.hash, searchParams, refreshUser, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      console.log('User already authenticated, redirecting to dashboard');
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

      // Ensure role is valid
      const role = values.role || 'participant';
      if (!['participant', 'organizer'].includes(role)) {
        toast.error("Invalid role specified");
        setIsLoading(false);
        return;
      }

      await registerUser(values);
      
      // Success! Notify the user to check email
      toast.success("🎉 Please check your email to confirm your account.");
      console.log('Signup successful, email confirmation sent');
      setEmailSent(true);
      setAuthProcessed(true);
      
    } catch (error: any) {
      // Handle errors gracefully
      let errorMessage = "Something went wrong during signup";
      
      if (error.message) {
        // Check for rate limiting error
        if (error.message.includes('security purposes') && error.message.includes('seconds')) {
          errorMessage = "For security reasons, please wait a few seconds before trying again";
        }
        // Check for other common errors
        else if (error.message.includes('violates row-level security')) {
          errorMessage = "Account creation failed: permission denied";
          console.error("RLS violation during signup:", error);
        }
        else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = () => {
    console.log('Manual navigation to dashboard');
    navigate('/');
  };

  const resendConfirmationEmail = async () => {
    // Placeholder for resend confirmation functionality
    toast.info("Confirmation email functionality will be implemented in a future update");
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
          {/* Email Confirmation Processing Alert */}
          {(location.hash && location.hash.includes('access_token')) && (
            <Alert className="mb-4 bg-blue-50">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Processing your authentication... Please wait.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Email Confirmed Alert */}
          {emailConfirmed && (
            <Alert className="mb-4 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <AlertTitle>Email Confirmed!</AlertTitle>
                <AlertDescription>
                  Your email has been verified successfully.
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          {/* Email Sent Alert */}
          {emailSent && !emailConfirmed && (
            <Alert className="mb-6 bg-blue-50">
              <MailIcon className="h-4 w-4" />
              <div className="ml-2">
                <AlertTitle>Check Your Email</AlertTitle>
                <AlertDescription>
                  We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account.
                  <Button 
                    variant="link" 
                    className="p-0 ml-1 text-blue-600" 
                    onClick={resendConfirmationEmail}>
                    Resend email
                  </Button>
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          {/* Show signup form only if email hasn't been sent yet */}
          {!emailSent && (
            <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}
          
          {/* Continue button - Only show if authenticated or auth processed */}
          {(isAuthenticated || authProcessed) && (
            <div className="mt-4 text-center">
              <Button 
                onClick={goToDashboard} 
                className="w-full"
                variant="outline"
              >
                Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
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
