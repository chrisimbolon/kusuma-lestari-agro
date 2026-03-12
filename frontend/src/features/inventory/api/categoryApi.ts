import api from "../../../lib/axios";
export const categoryApi = {
  list:   () => api.get("/categories/").then(r=>r.data),
  create: (data: { name: string; description?: string }) => api.post("/categories/", data).then(r=>r.data),
  update: (id: string, data: { name?: string; description?: string }) => api.patch(`/categories/${id}/`, data).then(r=>r.data),
};
