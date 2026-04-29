/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/auth/hooks/useAuth.ts                   ║
 * ║                                                               ║
 * ║  Single hook that components use for all auth operations.    ║
 * ║  Components should NEVER import useAuthStore directly —      ║
 * ║  always go through this hook.                                ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import type { LoginPayload } from "../api/authApi";
import { authApi } from "../api/authApi";

// ══════════════════════════════════════════════════════════════
//  HOOK
// ══════════════════════════════════════════════════════════════

export function useAuth() {
  const navigate = useNavigate();

  const {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    setToken,
    logout: storeLogout,
  } = useAuthStore();

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (payload: LoginPayload) => {
    const { access, user } = await authApi.login(payload);

    // Store access token in memory + user in localStorage
    setAuth(user, access);

    // Navigate to dashboard after login
    navigate("/dashboard", { replace: true });
  }, [setAuth, navigate]);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Tell the server to blacklist the refresh token + clear cookie
      await authApi.logout();
    } catch {
      // Even if this fails (e.g. network error), clear client state
    } finally {
      storeLogout();
      navigate("/login", { replace: true });
    }
  }, [storeLogout, navigate]);

  // ── Bootstrap: re-hydrate on app start ────────────────────
  /**
   * On a fresh tab or page refresh, accessToken is null (memory-only).
   * But the HttpOnly cookie may still be valid.
   * Call /api/auth/me/ — the axios interceptor will:
   *   1. Get 401 (no access token)
   *   2. Auto-call /api/auth/token/refresh/ using the cookie
   *   3. Retry /api/auth/me/ with the new access token
   *   4. Return the user profile
   *
   * This is the magic that keeps users "logged in" across refreshes.
   */
  const hasBootstrapped = useRef(false);

  const bootstrap = useCallback(async () => {
    // Only run if we have a persisted user but no access token (page refresh scenario)
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const persistedUser = useAuthStore.getState().user;
    const currentToken  = useAuthStore.getState().accessToken;

    // Already have a token in memory — nothing to do
    if (currentToken) return;

    // We have a user profile persisted but no token → try silent refresh
    if (persistedUser) {
      try {
        const freshUser = await authApi.getMe();
        // setToken was already called by the axios interceptor during refresh
        // Just update user profile in case it changed
        const token = useAuthStore.getState().accessToken;
        if (token) setAuth(freshUser, token);
      } catch {
        // Refresh cookie also expired → fully logged out
        storeLogout();
      }
    }
  }, [setAuth, setToken, storeLogout]);

  return {
    // ── State ────────────────────────────────────────────────
    user,
    accessToken,
    isAuthenticated,

    // ── Actions ──────────────────────────────────────────────
    login,
    logout,
    bootstrap,

    // ── Role helpers ─────────────────────────────────────────
    isOwner: user?.role === "owner",
    isAdmin: user?.role === "admin" || user?.role === "owner",
    isStaff: user?.is_staff ?? false,
  };
}