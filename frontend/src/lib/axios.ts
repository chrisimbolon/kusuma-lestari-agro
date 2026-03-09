/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║      PT. KUSUMA LESTARI AGRO — ACCOUNTING SYSTEM            ║
 * ║                      lib/axios.ts                            ║
 * ║                                                              ║
 * ║  Axios instance with:                                        ║
 * ║  - Base URL from env                                         ║
 * ║  - Auto-attach Bearer token on every request                 ║
 * ║  - Auto-refresh token on 401 (silent refresh)                ║
 * ║  - Redirect to /login on refresh failure                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";
import type { TokenRefreshResponse } from "../types/auth";
import { clearTokens, getTokens, setTokens } from "./tokenStorage";

// ─────────────────────────────────────────────────────────────
//  BASE INSTANCE
// ─────────────────────────────────────────────────────────────

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// ─────────────────────────────────────────────────────────────
//  REQUEST INTERCEPTOR — attach access token
// ─────────────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = getTokens();
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);


// ─────────────────────────────────────────────────────────────
//  RESPONSE INTERCEPTOR — silent token refresh on 401
// ─────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry token endpoint itself (prevents infinite loop)
    if (originalRequest.url?.includes("/token/")) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh resolves
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = getTokens();
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post<TokenRefreshResponse>(
        `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"}/token/refresh/`,
        { refresh: refreshToken },
      );

      setTokens({ accessToken: data.access, refreshToken });
      processQueue(null, data.access);

      originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
      return api(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
