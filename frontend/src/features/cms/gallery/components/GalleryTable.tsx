/**
 * src/features/cms/gallery/components/GalleryTable.tsx
 *
 * Fix: removed import from '../types/gallery.types' (file doesn't exist)
 * Types are exported directly from galleryApi.ts as per our architecture.
 */

import type { GalleryImage } from "../api/galleryApi";

interface Props {
  data:     GalleryImage[];
  loading:  boolean;
  onDelete: (id: string) => void;
}

export default function GalleryTable({ data, loading, onDelete }: Props) {
  if (loading) return <div>Loading...</div>;

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
              <img src={item.image} width={80} alt={item.title} />
            </td>
            <td>{item.title}</td>
            <td>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
