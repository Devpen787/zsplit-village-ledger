
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
    if (!loading && !isAuthenticated) {
      navigate('/login');
    } else if (!loading && requiredRole && !hasRole(requiredRole)) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate, requiredRole, hasRole]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only render children if authenticated and role requirements are met
  if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    return null;
  }

  return <Outlet />;
};
