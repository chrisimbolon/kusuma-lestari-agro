import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../api/productApi";
import type { ProductWritePayload } from "../../../types/inventory";
const P = { all:["products"] as const, list:(p?:unknown)=>["products","list",p] as const, detail:(id:string)=>["products",id] as const, lowStock:["products","lowstock"] as const, valuation:["products","valuation"] as const };
export function useProductList(params?: Record<string,unknown>) { return useQuery({ queryKey: P.list(params), queryFn: () => productApi.list(params) }); }
export function useProductDetail(id: string) { return useQuery({ queryKey: P.detail(id), queryFn: () => productApi.detail(id), enabled: !!id }); }
export function useLowStock() { return useQuery({ queryKey: P.lowStock, queryFn: productApi.lowStock }); }
export function useInventoryValuation() { return useQuery({ queryKey: P.valuation, queryFn: productApi.valuation }); }
export function useProductCreate() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: ProductWritePayload) => productApi.create(d), onSuccess: () => qc.invalidateQueries({ queryKey: P.all }) });
}
