/**
 * lib/tokenStorage.ts
 *
 * Reads/writes JWT tokens from localStorage — same store as Zustand persist.
 * Zustand stores the entire auth state under "kla-auth" as a JSON blob.
 * We read directly from that blob so axios always has the current token.
 *
 * Why localStorage (not sessionStorage)?
 *   - Zustand `persist` defaults to localStorage
 *   - sessionStorage is cleared on tab close / page refresh
 *   - ERP users expect to stay logged in across refreshes
 */

const ZUSTAND_KEY = "kla-auth";

interface PersistedAuth {
  state: {
    accessToken:  string | null;
    refreshToken: string | null;
  };
}

export interface StoredTokens {
  accessToken:  string | null;
  refreshToken: string | null;
}

export const getTokens = (): StoredTokens => {
  try {
    const raw = localStorage.getItem(ZUSTAND_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed: PersistedAuth = JSON.parse(raw);
    return {
      accessToken:  parsed?.state?.accessToken  ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
};

export const setTokens = ({ accessToken, refreshToken }: {
  accessToken:  string;
  refreshToken: string;
}): void => {
  try {
    const raw = localStorage.getItem(ZUSTAND_KEY);
    const parsed: PersistedAuth = raw ? JSON.parse(raw) : { state: {} };
    parsed.state.accessToken  = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem(ZUSTAND_KEY, JSON.stringify(parsed));
  } catch {}
};

export const clearTokens = (): void => {
  try {
    const raw = localStorage.getItem(ZUSTAND_KEY);
    if (!raw) return;
    const parsed: PersistedAuth = JSON.parse(raw);
    parsed.state.accessToken  = null;
    parsed.state.refreshToken = null;
    localStorage.setItem(ZUSTAND_KEY, JSON.stringify(parsed));
  } catch {}
};

export const hasTokens = (): boolean => {
  const { accessToken } = getTokens();
  return !!accessToken;
};
