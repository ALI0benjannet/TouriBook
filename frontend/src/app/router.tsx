import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/features/auth/guards/ProtectedRoute";
import { AdminRoute } from "@/features/auth/guards/AdminRoute";
import { GuestRoute } from "@/features/auth/guards/GuestRoute";
import { RouteError } from "@/components/feedback/RouteError";
import { FullPageLoader } from "@/components/feedback/FullPageLoader";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/Register"));
const VerifyEmailPage = lazy(() => import("@/features/auth/pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage"));
const CheckEmailPage = lazy(() => import("@/features/auth/pages/CheckEmailPage"));
const ProfilePage = lazy(() => import("@/features/auth/pages/ProfilePage"));
const ActivitiesPage = lazy(() => import("@/pages/ActivitiesPage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const BookingsPage = lazy(() => import("@/pages/BookingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<FullPageLoader />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "403", element: withSuspense(<ForbiddenPage />) },
      { path: "activities", element: withSuspense(<ActivitiesPage />) },
      { path: "favorites", element: withSuspense(<FavoritesPage />) },
      { path: "bookings", element: withSuspense(<BookingsPage />) },

      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: "login", element: withSuspense(<LoginPage />) },
              { path: "register", element: withSuspense(<RegisterPage />) },
              { path: "verify-email", element: withSuspense(<VerifyEmailPage />) },
              { path: "forgot-password", element: withSuspense(<ForgotPasswordPage />) },
              { path: "reset-password", element: withSuspense(<ResetPasswordPage />) },
              { path: "check-email", element: withSuspense(<CheckEmailPage />) },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [{ path: "profile", element: withSuspense(<ProfilePage />) }],
      },
    ],
  },

  // Espace administrateur
  {
    path: "/admin",
    errorElement: <RouteError />,
    children: [
      { path: "login", element: withSuspense(<AdminLoginPage />) },
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: withSuspense(<DashboardPage />) },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: withSuspense(<NotFoundPage />) },
]);





