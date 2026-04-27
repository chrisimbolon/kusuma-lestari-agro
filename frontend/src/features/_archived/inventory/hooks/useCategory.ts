// src/features/inventory/hooks/useCategory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import type { ProductCategory, ProductCategoryWritePayload } from "../../../types/inventory";

const KEY = { all: ["categories"] as const, list: ["categories", "list"] as const };

export function useCategoryList() {
  return useQuery({
    queryKey: KEY.list,
    queryFn: () => api.get("/categories/").then(r => r.data),
  });
}

export function useCategoryCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCategoryWritePayload) => api.post("/categories/", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.all }),
  });
}

export function useCategoryUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductCategoryWritePayload> }) =>
      api.patch(`/categories/${id}/`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.all }),
  });
}

export function useCategoryDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY.all }),
  });
}
