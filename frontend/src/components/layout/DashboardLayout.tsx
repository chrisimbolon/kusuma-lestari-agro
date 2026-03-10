// ============================================================
//  src/components/layout/DashboardLayout.tsx
// ============================================================

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

  const sidebarW = collapsed ? 68 : 260;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0ebe0" }}>
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
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          minWidth: 0,
        }}
      >
        <Topbar sidebarCollapsed={collapsed} />
        <main style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
