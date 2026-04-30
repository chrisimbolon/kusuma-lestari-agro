// features/cms/components/GalleryTable.tsx

import { Gallery } from '../types/gallery.types'

interface Props {
  data: Gallery[]
  loading: boolean
  onDelete: (id: string) => void
}

export default function GalleryTable({ data, loading, onDelete }: Props) {
  if (loading) return <div>Loading...</div>

  return (
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Title</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>
              <img src={item.imageUrl} width={80} />
            </td>
            <td>{item.title}</td>
            <td>
              <button onClick={() => onDelete(item.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}