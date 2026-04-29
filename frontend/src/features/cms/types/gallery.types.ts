// features/cms/types/gallery.types.ts

export interface Gallery {
  id: string
  title: string
  imageUrl: string
  createdAt: string
}

export interface CreateGalleryPayload {
  title: string
  image: File
}