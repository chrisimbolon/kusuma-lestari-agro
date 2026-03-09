/**
 * lib/queryClient.ts
 * React Query client — configured for DRF pagination and error handling.
 */

import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:         1000 * 60 * 2,   // 2 min — CoA, products rarely change
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        // Don't retry on 400/401/403/404
        if (status && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
