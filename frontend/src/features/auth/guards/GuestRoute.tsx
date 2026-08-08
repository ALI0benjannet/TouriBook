import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  return <Outlet />;
}