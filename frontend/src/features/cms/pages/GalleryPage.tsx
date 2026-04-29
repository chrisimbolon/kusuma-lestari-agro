// features/cms/pages/GalleryPage.tsx

import { PageHeader } from '@/components/shared/PageHeader'
import GalleryForm from '../components/GalleryForm'
import GalleryTable from '../components/GalleryTable'
import { useGallery } from '../hooks/useGallery'

export default function GalleryPage() {
  const {
    gallery,
    isLoading,
    createGallery,
    deleteGallery,
  } = useGallery()

  return (
    <div>
      <PageHeader title="Gallery CMS" />

      <GalleryForm onSubmit={createGallery} />

      <GalleryTable
        data={gallery}
        loading={isLoading}
        onDelete={deleteGallery}
      />
    </div>
  )
}