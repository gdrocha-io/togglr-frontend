import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRoot?: boolean;
}

export function ProtectedRoute({ children, requireRoot = false }: ProtectedRouteProps) {
  const { user, isLoading, isRoot } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRoot && !isRoot) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
