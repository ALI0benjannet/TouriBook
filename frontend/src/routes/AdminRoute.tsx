import { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { FullPageLoader } from "@/components/common/FullPageLoader";
import { paths } from "@/routes/paths";

interface AdminRouteProps {
  children?: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location }} replace />;
  }
  if (!isAdmin) return <Navigate to={paths.forbidden} replace />;
  return children ? <>{children}</> : <Outlet />;
}