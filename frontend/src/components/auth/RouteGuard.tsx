import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../api/userApi";

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
