import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import AuthGuard from "../middleware/AuthGuard";

// ✅ FIX: use alias (prevents silent lazy failure)
const LandingPage  = lazy(() => import("@/features/landing/pages/LandingPage"));
const LoginPage    = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const GalleryPage = lazy(() => import("@/features/cms/pages/GalleryPage"));
const PublicGalleryPage = lazy(() => import("@/features/cms/pages/PublicGalleryPage"));
const NotFoundPage = lazy(() => import("@/features/errors/NotFoundPage"));

const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    {children}
  </Suspense>
);

const ProtectedShell = () => (
  <AuthGuard>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </AuthGuard>
);

export const router = createBrowserRouter([

  // ✅ PUBLIC
  {
    path: "/",
    element: <Lazy><LandingPage /></Lazy>,
  },
  {
    path: "/login",
    element: <Lazy><LoginPage /></Lazy>,
  },
  {
    path: "/register",
    element: <Lazy><RegisterPage /></Lazy>,
  },
  {
    path: "/gallery",
    element: <Lazy><PublicGalleryPage /></Lazy>,
  },

  // ✅ PROTECTED
  {
    element: <ProtectedShell />,
    children: [
      {
        path: "/dashboard",
        element: <Lazy><DashboardPage /></Lazy>,
      },
      {
        path: "/cms/gallery",
        element: <Lazy><GalleryPage /></Lazy>,
      },
      {
        path: "/app",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },

  // ✅ 404
  {
    path: "*",
    element: <Lazy><NotFoundPage /></Lazy>,
  },
]);