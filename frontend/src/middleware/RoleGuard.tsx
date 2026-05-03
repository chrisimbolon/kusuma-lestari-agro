/**
 * src/middleware/RoleGuard.tsx
 *
 * Fix: removed import from "../types/auth" (file doesn't exist)
 * UserRole is exported from authStore.ts — single source of truth.
 */

import type { AuthUser } from "../store/authStore";
import { useAuthStore } from "../store/authStore";

type UserRole = AuthUser["role"];   // "owner" | "admin" | "staff"

interface Props {
  allow:    UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allow, children }: Props) {
  const { user } = useAuthStore();

  if (!user || !allow.includes(user.role)) {
    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          height:         "60vh",
          gap:            12,
          fontFamily:     "sans-serif",
        }}
      >
        <div style={{ fontSize: 40 }}>🔒</div>
        <h2 style={{ color: "#1a2e1a" }}>Akses Dibatasi</h2>
        <p style={{ color: "#7a9a7a" }}>
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
