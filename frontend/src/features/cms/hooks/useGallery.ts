// features/cms/hooks/useGallery.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { galleryApi } from '../api/galleryApi'
import { CreateGalleryPayload } from '../types/gallery.types'

export const useGallery = () => {
  const queryClient = useQueryClient()

  // 📥 Fetch
  const galleryQuery = useQuery({
    queryKey: ['gallery'],
    queryFn: galleryApi.getAll,
  })

  // ➕ Create
  const createMutation = useMutation({
    mutationFn: (payload: CreateGalleryPayload) =>
      galleryApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })

  // ❌ Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
  })

  return {
    // data
    gallery: galleryQuery.data ?? [],
    isLoading: galleryQuery.isLoading,
    isError: galleryQuery.isError,

    // actions
    createGallery: createMutation.mutate,
    isCreating: createMutation.isPending,

    deleteGallery: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}