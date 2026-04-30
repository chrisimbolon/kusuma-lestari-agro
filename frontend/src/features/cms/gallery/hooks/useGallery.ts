/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/cms/gallery/hooks/useGallery.ts         ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { galleryApi, type GalleryMutatePayload } from "../api/galleryApi";

export const GALLERY_ADMIN_KEY  = ["gallery", "admin"]  as const;
export const GALLERY_PUBLIC_KEY = ["gallery", "public"] as const;

export function useGallery() {
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["gallery"] });

  const query = useQuery({
    queryKey: GALLERY_ADMIN_KEY,
    queryFn:  galleryApi.listAdmin,
    staleTime: 1000 * 60 * 2,
  });

  const createMutation = useMutation({
    mutationFn: (payload: GalleryMutatePayload) => galleryApi.create(payload),
    onSuccess:  invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<GalleryMutatePayload, "image"> }) =>
      galleryApi.update(id, payload),
    onSuccess: invalidate,
  });

  const replaceImageMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GalleryMutatePayload }) =>
      galleryApi.replaceImage(id, payload),
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      galleryApi.reorder(id, order),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => galleryApi.remove(id),
    onSuccess:  invalidate,
  });

  return {
    images:    query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    refetch:   query.refetch,
    create:       createMutation,
    update:       updateMutation,
    replaceImage: replaceImageMutation,
    reorder:      reorderMutation,
    remove:       removeMutation,
  };
}