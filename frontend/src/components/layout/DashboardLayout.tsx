/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/components/layout/DashboardLayout.tsx            ║
 * ║                                                               ║
 * ║  Fix: logout via useAuth() not useAuthStore() directly.      ║
 * ║  useAuth().logout() hits /api/auth/logout/, blacklists the   ║
 * ║  refresh token, clears the HttpOnly cookie, then redirects.  ║
 * ║  useAuthStore().logout() only clears client state — the      ║
 * ║  server cookie stays alive and the user stays "logged in".   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth"; // ← useAuth, not useAuthStore
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // ✅ useAuth() — logout calls the server + clears cookie
  // ❌ useAuthStore() — logout only clears memory, cookie survives
  const { user, logout } = useAuth();

  const sidebarW = collapsed ? 68 : 260;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f0ebe0" }}>
      <Sidebar
        userRole={user?.role ?? "staff"}
        userName={user?.full_name ?? "—"}
        userInitials={
          (user?.full_name ?? "?")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        }
        onLogout={logout}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />

      <div
        style={{
          marginLeft: sidebarW,
          flex:       1,
          display:    "flex",
          flexDirection: "column",
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          minWidth:   0,
        }}
      >
        <Topbar sidebarCollapsed={collapsed} />
        <main style={{ flex:1, padding:"24px 28px", minWidth:0 }}>
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
