
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export const ProtectedRoute = ({
  requiredRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're done loading and the user isn't authenticated
    if (!loading && !isAuthenticated) {
      navigate('/login');
    } else if (!loading && requiredRole && !hasRole(requiredRole)) {
      // Only redirect for role issues after loading is complete
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate, requiredRole, hasRole]);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // When authenticated via Privy but user profile is not fully loaded yet,
  // show a loading spinner instead of redirecting to avoid flickering
  if (isAuthenticated && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only check role requirements after loading is complete
  if (!loading && requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return <Outlet />;
};
