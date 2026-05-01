/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║              src/lib/axios.ts                                 ║
 * ║                                                               ║
 * ║  Features:                                                    ║
 * ║  • Injects Bearer token on every request                     ║
 * ║  • Silent token refresh on 401 (uses HttpOnly cookie)        ║
 * ║  • Queues concurrent requests during refresh                  ║
 * ║  • Auto-logout on refresh failure                            ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */
import type {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";

// ── Config ─────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ══════════════════════════════════════════════════════════════
//  AXIOS INSTANCE
// ══════════════════════════════════════════════════════════════

export const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,    // ← MUST be true — sends HttpOnly cookie on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ══════════════════════════════════════════════════════════════
//  REQUEST INTERCEPTOR — attach access token
// ══════════════════════════════════════════════════════════════

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ══════════════════════════════════════════════════════════════
//  RESPONSE INTERCEPTOR — silent refresh on 401
// ══════════════════════════════════════════════════════════════

/**
 * Queue pattern: if a refresh is already in-flight, hold all
 * other 401'd requests and resolve/reject them together once
 * the refresh completes. Prevents duplicate refresh calls.
 */
let isRefreshing = false;
let failedQueue:  Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401s that haven't already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't intercept the refresh endpoint itself (avoid infinite loop)
    if (originalRequest.url?.includes("/api/auth/token/refresh/")) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is in-flight → queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    // Mark as retrying and kick off the refresh
    originalRequest._retry = true;
    isRefreshing            = true;

    try {
      // POST with no body — refresh token is sent automatically via HttpOnly cookie
      const { data } = await api.post<{ access: string }>(
        "/api/auth/token/refresh/"
      );

      const newAccess = data.access;
      useAuthStore.getState().setToken(newAccess);

      // Inject new token into the retried request
      if (originalRequest.headers) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
      }

      processQueue(null, newAccess);
      return api(originalRequest);

    } catch (refreshError) {
      // Refresh failed → session truly expired
      processQueue(refreshError);
      useAuthStore.getState().logout();

      // Optionally redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;