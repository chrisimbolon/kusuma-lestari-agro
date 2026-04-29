// ============================================================
//  src/routes/router.tsx
//
//  CMS-first architecture (ERP removed)
// ============================================================

import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import AuthGuard from "../middleware/AuthGuard";

// ── PUBLIC pages ───────────────────────────────────────────
const LandingPage  = lazy(() => import("../features/landing/pages/LandingPage"));
const LoginPage    = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));

// ── CORE (safe existing pages) ─────────────────────────────
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const GalleryPage = lazy(() => import("../features/cms/pages/GalleryPage"));

// ── Errors ─────────────────────────────────────────────────
const NotFoundPage = lazy(() => import("../features/errors/NotFoundPage"));

// ── Suspense wrapper ───────────────────────────────────────
const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    {children}
  </Suspense>
);

// ── Protected shell ────────────────────────────────────────
const ProtectedShell = () => (
  <AuthGuard>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </AuthGuard>
);

// ==========================================================
// ROUTER
// ==========================================================

export const router = createBrowserRouter([

  // ── PUBLIC ──────────────────────────────────────────────
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

  // ── PROTECTED ───────────────────────────────────────────
  {
    element: <ProtectedShell />,
    children: [

      // Dashboard
      {
        path: "/dashboard",
        element: <Lazy><DashboardPage /></Lazy>,
      },
       {
        path: "/cms/gallery",
        element: <Lazy><GalleryPage /></Lazy>,
      },
      // Redirect root → dashboard (optional UX)
      {
        path: "/app",
        element: <Navigate to="/dashboard" replace />,
      },

    ],
  },

  // ── 404 ────────────────────────────────────────────────
  {
    path: "*",
    element: <Lazy><NotFoundPage /></Lazy>,
  },
]);