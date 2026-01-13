import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "../types/auth";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { user, hasRole } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/flights" replace />;
  }

  return <>{children}</>;
}
