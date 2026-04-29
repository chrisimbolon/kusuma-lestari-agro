// features/cms/api/galleryApi.ts

import axios from '@/lib/axios'
import { CreateGalleryPayload, Gallery } from '../types/gallery.types'

export const galleryApi = {
  getAll: async (): Promise<Gallery[]> => {
    const res = await axios.get('/cms/gallery')
    return res.data
  },

  create: async (payload: CreateGalleryPayload): Promise<Gallery> => {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('image', payload.image)

    const res = await axios.post('/cms/gallery', formData)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`/cms/gallery/${id}`)
  },
}