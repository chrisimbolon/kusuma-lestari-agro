/**
 * src/features/auth/api/authApi.ts
 *
 * Matches the KLA Django backend endpoints exactly:
 *   POST /api/token/          → login   (returns { access, refresh, user })
 *   POST /api/token/refresh/  → refresh (returns { access })
 *   POST /api/token/blacklist/→ logout  (blacklists refresh token)
 *   POST /api/auth/register/  → register (returns { access, refresh, user, message })
 *   GET  /api/auth/me/        → current user profile
 */

import api from "../../../lib/axios";
import type { AuthUser } from "../../../types/auth";

// ── Response shapes ───────────────────────────────────────────

export interface LoginResponse {
  access:  string;
  refresh: string;
  user:    AuthUser;
}

export interface RegisterResponse {
  access:  string;
  refresh: string;
  user:    AuthUser;
  message: string;
}

export interface RegisterPayload {
  full_name: string;
  email:     string;
  password:  string;
  password2: string;
}

// ── API calls ─────────────────────────────────────────────────

export const authApi = {
  /**
   * Login with email + password.
   * Backend accepts "email" as the username field.
   */
  login: (data: { username: string; password: string }) =>
    api
      .post<LoginResponse>("/token/", {
        email:    data.username,   // frontend sends "username", map to "email"
        password: data.password,
      })
      .then(r => r.data),

  /**
   * Register a new account.
   * Returns tokens immediately — user is logged in right after.
   */
  register: (data: RegisterPayload) =>
    api
      .post<RegisterResponse>("/auth/register/", data)
      .then(r => r.data),

  /**
   * Refresh access token using stored refresh token.
   */
  refresh: (refresh: string) =>
    api
      .post<{ access: string }>("/token/refresh/", { refresh })
      .then(r => r.data),

  /**
   * Logout — blacklists the refresh token server-side.
   */
  logout: (refresh: string) =>
    api
      .post("/token/blacklist/", { refresh })
      .then(r => r.data),

  /**
   * Get current authenticated user profile.
   */
  me: () =>
    api.get<AuthUser>("/auth/me/").then(r => r.data),
};
