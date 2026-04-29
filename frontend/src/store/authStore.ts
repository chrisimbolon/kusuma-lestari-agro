/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║              src/store/authStore.ts                           ║
 * ║                                                               ║
 * ║  Security model:                                              ║
 * ║  • accessToken  → memory only (Zustand, NOT persisted)       ║
 * ║  • refreshToken → HttpOnly cookie (set by Django, JS-blind)  ║
 * ║  • user profile → localStorage via persist (non-sensitive)   ║
 * ║  • isAuthenticated → DERIVED from accessToken, never stored  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ── Types ──────────────────────────────────────────────────────
export interface AuthUser {
  id:        string;
  email:     string;
  full_name: string;
  role:      "owner" | "admin" | "staff";
  is_staff:  boolean;
}

interface AuthState {
  // ── State ──────────────────────────────────────────────────
  user:            AuthUser | null;
  accessToken:     string | null;     // Memory only — never persisted

  // ── Derived (computed) ─────────────────────────────────────
  isAuthenticated: boolean;           // Derived from accessToken

  // ── Actions ────────────────────────────────────────────────
  setAuth:    (user: AuthUser, accessToken: string) => void;
  setToken:   (accessToken: string) => void;
  clearToken: () => void;             // Called when access token expires
  logout:     () => void;             // Full reset — also hits /api/auth/logout/
}

// ══════════════════════════════════════════════════════════════
//  STORE
// ══════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ── Initial state ─────────────────────────────────────
      user:            null,
      accessToken:     null,
      isAuthenticated: false,

      // ── setAuth: called after successful login ─────────────
      // Only receives accessToken — refresh lives in HttpOnly cookie
      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),

      // ── setToken: called after silent token refresh ────────
      setToken: (accessToken) =>
        set((state) => ({
          accessToken,
          isAuthenticated: true,
          user: state.user,           // preserve existing user
        })),

      // ── clearToken: access expired, awaiting refresh ───────
      clearToken: () =>
        set({ accessToken: null, isAuthenticated: false }),

      // ── logout: full session reset ─────────────────────────
      logout: () =>
        set({
          user:            null,
          accessToken:     null,
          isAuthenticated: false,
        }),
    }),

    {
      name: "kla-auth",
      storage: createJSONStorage(() => localStorage),

      // ⚠️  CRITICAL: Only persist the user PROFILE.
      //     accessToken is memory-only — lost on tab close.
      //     On next visit, /api/auth/token/refresh/ re-issues
      //     a new access token using the HttpOnly cookie silently.
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);