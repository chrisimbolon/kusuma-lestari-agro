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

// ── CMS (create these later if not yet) ─────────────────────
// ⚠️ If not created yet, comment them temporarily
// const CompanyPage  = lazy(() => import("../features/cms/pages/CompanyPage"));
// const TeamPage     = lazy(() => import("../features/cms/pages/TeamPage"));
// const ServicesPage = lazy(() => import("../features/cms/pages/ServicesPage"));
// const MessagesPage = lazy(() => import("../features/cms/pages/MessagesPage"));

// ── Settings (keep only if still exists) ────────────────────
// ⚠️ If deleted earlier, comment out
// const UserManagementPage = lazy(() => import("../features/settings/pages/UserManagementPage"));

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

      // Redirect root → dashboard (optional UX)
      {
        path: "/app",
        element: <Navigate to="/dashboard" replace />,
      },

      // ── CMS ROUTES (enable when ready) ──────────────────
      /*
      {
        path: "cms",
        children: [
          { index: true, element: <Navigate to="/cms/company" replace /> },
          { path: "company", element: <Lazy><CompanyPage /></Lazy> },
          { path: "team", element: <Lazy><TeamPage /></Lazy> },
          { path: "services", element: <Lazy><ServicesPage /></Lazy> },
          { path: "messages", element: <Lazy><MessagesPage /></Lazy> },
        ],
      },
      */

      // ── SETTINGS (optional minimal) ─────────────────────
      /*
      {
        path: "settings",
        children: [
          { index: true, element: <Navigate to="/settings/users" replace /> },
          {
            path: "users",
            element: (
              <RoleGuard allow={["admin", "owner"]}>
                <Lazy><UserManagementPage /></Lazy>
              </RoleGuard>
            ),
          },
        ],
      },
      */

    ],
  },

  // ── 404 ────────────────────────────────────────────────
  {
    path: "*",
    element: <Lazy><NotFoundPage /></Lazy>,
  },
]);