/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/cms/gallery/api/galleryApi.ts           ║
 * ║                                                               ║
 * ║  Full CRUD — types exported here (no separate types file).   ║
 * ║  Public list: unauthenticated.                               ║
 * ║  Mutations: require Bearer token (axios interceptor handles) ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import api from "../../../../lib/axios";

// ─────────────────────────────────────────────────────────────
//  TYPES  (export from here — don't import from a types/ folder)
// ─────────────────────────────────────────────────────────────

export interface GalleryImage {
  id:         string;
  title:      string;
  caption:    string;
  image:      string;
  is_active:  boolean;
  order:      number;
  created_at: string;
  updated_at: string;
}

export interface GalleryListResponse {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  GalleryImage[];
}

export interface GalleryMutatePayload {
  title:      string;
  caption?:   string;
  is_active?: boolean;
  order?:     number;
  image?:     File;
}

// ─────────────────────────────────────────────────────────────
//  URL NORMALISER
// ─────────────────────────────────────────────────────────────

const BACKEND = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export function normaliseImageUrl(raw: string): string {
  try {
    const url  = new URL(raw);
    const base = new URL(BACKEND);
    url.protocol = base.protocol;
    url.host     = base.host;
    return url.toString();
  } catch {
    return raw;
  }
}

function normaliseList(images: GalleryImage[]): GalleryImage[] {
  return images.map((img) => ({ ...img, image: normaliseImageUrl(img.image) }));
}

function toFormData(payload: GalleryMutatePayload): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  if (payload.caption   !== undefined) fd.append("caption",   payload.caption);
  if (payload.is_active !== undefined) fd.append("is_active", String(payload.is_active));
  if (payload.order     !== undefined) fd.append("order",     String(payload.order));
  if (payload.image instanceof File)   fd.append("image",     payload.image);
  return fd;
}

// ─────────────────────────────────────────────────────────────
//  API
// ─────────────────────────────────────────────────────────────

export const galleryApi = {

  listPublic: async (): Promise<GalleryImage[]> => {
    const { data } = await api.get<GalleryListResponse>("/api/cms/gallery/");
    return normaliseList(
      data.results.filter((i) => i.is_active).sort((a, b) => a.order - b.order)
    );
  },

  listAdmin: async (): Promise<GalleryImage[]> => {
    const { data } = await api.get<GalleryListResponse>("/api/cms/gallery/?all=true");
    return normaliseList(data.results.sort((a, b) => a.order - b.order));
  },

  create: async (payload: GalleryMutatePayload): Promise<GalleryImage> => {
    const { data } = await api.post<GalleryImage>(
      "/api/cms/gallery/",
      toFormData(payload),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return { ...data, image: normaliseImageUrl(data.image) };
  },

  update: async (id: string, payload: Omit<GalleryMutatePayload, "image">): Promise<GalleryImage> => {
    const { data } = await api.patch<GalleryImage>(`/api/cms/gallery/${id}/`, payload);
    return { ...data, image: normaliseImageUrl(data.image) };
  },

  replaceImage: async (id: string, payload: GalleryMutatePayload): Promise<GalleryImage> => {
    const { data } = await api.put<GalleryImage>(
      `/api/cms/gallery/${id}/`,
      toFormData(payload),
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return { ...data, image: normaliseImageUrl(data.image) };
  },

  reorder: async (id: string, order: number): Promise<GalleryImage> => {
    const { data } = await api.patch<GalleryImage>(`/api/cms/gallery/${id}/`, { order });
    return { ...data, image: normaliseImageUrl(data.image) };
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/api/cms/gallery/${id}/`);
  },
};