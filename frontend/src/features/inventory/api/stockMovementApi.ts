import api from "../../../lib/axios";
import type { StockMovementList, StockMovementCreatePayload } from "../../../types/inventory";
import type { PaginatedResponse } from "../../../types/common";
export const stockMovementApi = {
  list:   (p?: Record<string,unknown>) => api.get<PaginatedResponse<StockMovementList>>("/stock-movements/", { params:p }).then(r=>r.data),
  detail: (id: string) => api.get<StockMovementList>(`/stock-movements/${id}/`).then(r=>r.data),
  create: (data: StockMovementCreatePayload) => api.post<StockMovementList>("/stock-movements/", data).then(r=>r.data),
};
