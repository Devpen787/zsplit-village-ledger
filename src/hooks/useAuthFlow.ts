
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from "@/contexts";
import { clearAuthState } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

export const useAuthFlow = (isSignup = false) => {
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
      if (ready && authenticated) {
        if (isActive) setIsLoading(true);
        console.log('Privy authenticated, refreshing user profile');
        
        try {
          // Try to refresh user profile with retry logic
          const retryRefreshUser = async () => {
            try {
              // Clean up any previous auth state
              if (retryCount.current === 0) {
                clearAuthState();
              }
              
              const user = await refreshUser();
              
              if (user && isActive) {
                console.log('User profile refreshed, navigating to dashboard');
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
                  setLocalError(`Failed to ${isSignup ? 'create your profile' : 'sign in'} after multiple attempts. Please try again.`);
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
  }, [ready, authenticated, navigate, refreshUser, location, isSignup]);

  // Redirect if authenticated through our context
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleAuth = () => {
    setIsLoading(true);
    setLocalError(null);
    clearAuthError();
    retryCount.current = 0;
    
    // Clean up any existing auth state
    clearAuthState();
    
    try {
      login();
      
      // Add a timeout to reset loading state if Privy doesn't redirect or fails silently
      if (loginTimeoutRef.current) {
        window.clearTimeout(loginTimeoutRef.current);
      }
      
      loginTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setLocalError(`${isSignup ? 'Signup' : 'Login'} timed out. Please try again.`);
      }, 15000); // 15 seconds timeout
    } catch (error) {
      console.error(`${isSignup ? 'Signup' : 'Login'} error:`, error);
      setIsLoading(false);
      setLocalError(`Failed to initiate ${isSignup ? 'signup' : 'login'}. Please try again.`);
      toast.error(`${isSignup ? 'Signup' : 'Login'} failed. Please try again.`);
    }
  };

  // Determine which error to display (local or from auth context)
  const displayError = localError || authError;
  
  // Determine if button should be in loading state
  const showLoadingButton = isLoading || authLoading || (authenticated && !isAuthenticated);

  return {
    handleAuth,
    displayError,
    showLoadingButton,
    loginAttempts,
  };
};
