import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Comma-separated roles. If set, the user must have at least one or be redirected to "/" */
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { token, expiresAt, devUser, hasRole } = useAuth();

  const isValid =
    !!devUser ||
    (!!token && !!expiresAt && expiresAt > Date.now());

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = requiredRole.split(",").map((r) => r.trim());
    if (!hasRole(...roles)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
