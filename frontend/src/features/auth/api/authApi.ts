/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/auth/api/authApi.ts                     ║
 * ║                                                               ║
 * ║  All auth API calls. Typed end-to-end.                       ║
 * ║  Import `api` from lib/axios — never raw axios.              ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import api from "../../../lib/axios";
import type { AuthUser } from "../../../store/authStore";

// ── Request / Response shapes ──────────────────────────────────

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface LoginResponse {
  access: string;
  user:   AuthUser;
}

// ══════════════════════════════════════════════════════════════
//  AUTH API
// ══════════════════════════════════════════════════════════════

export const authApi = {

  /**
   * POST /api/auth/login/
   * Returns access token in body + sets HttpOnly refresh cookie.
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/api/auth/login/", payload);
    return data;
  },

  /**
   * POST /api/auth/logout/
   * Blacklists refresh token + clears cookie server-side.
   * Requires valid access token (interceptor will attach it).
   */
  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout/");
  },

  /**
   * GET /api/auth/me/
   * Re-hydrates user profile from server (call on app boot).
   * If this returns 401, the interceptor will attempt a silent refresh.
   */
  getMe: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>("/api/auth/me/");
    return data;
  },
};