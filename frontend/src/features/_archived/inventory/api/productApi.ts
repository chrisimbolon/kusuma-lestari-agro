import api from "../../../lib/axios";
import type { ProductList, ProductDetail, ProductWritePayload, InventoryValuation } from "../../../types/inventory";
import type { PaginatedResponse } from "../../../types/common";
export const productApi = {
  list:      (p?: Record<string,unknown>) => api.get<PaginatedResponse<ProductList>>("/products/", { params:p }).then(r=>r.data),
  detail:    (id: string) => api.get<ProductDetail>(`/products/${id}/`).then(r=>r.data),
  create:    (data: ProductWritePayload) => api.post<ProductDetail>("/products/", data).then(r=>r.data),
  update:    (id: string, data: Partial<ProductWritePayload>) => api.patch<ProductDetail>(`/products/${id}/`, data).then(r=>r.data),
  movements: (id: string, p?: Record<string,unknown>) => api.get(`/products/${id}/movements/`, { params:p }).then(r=>r.data),
  lowStock:  () => api.get<ProductList[]>("/products/low_stock/").then(r=>r.data),
  valuation: () => api.get<InventoryValuation>("/products/valuation/").then(r=>r.data),
};
