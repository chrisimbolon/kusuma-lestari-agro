/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/cms/gallery/pages/GalleryPage.tsx       ║
 * ║                                                               ║
 * ║  Admin CMS — full CRUD for gallery images.                   ║
 * ║  • View all images (grid, search, filter)                    ║
 * ║  • Upload new image (file drop)                              ║
 * ║  • Edit title, caption, order, status                        ║
 * ║  • Replace image file                                        ║
 * ║  • Delete with confirmation                                  ║
 * ║  • Inline order editing (click number to edit)               ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import type { GalleryImage, GalleryMutatePayload } from "../api/galleryApi";
import { useGallery } from "../hooks/useGallery";

// ─────────────────────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  bg:          "#f2f4ee",
  surface:     "#ffffff",
  surfaceAlt:  "#f7f9f3",
  border:      "#e2e8d8",
  green:       "#2d4a14",
  greenMid:    "#3d6120",
  greenLight:  "#eef4e6",
  greenAccent: "#6abf3f",
  text:        "#1a2612",
  textMid:     "#4a5e38",
  textMuted:   "#7a8f68",
  danger:      "#c0392b",
  dangerLight: "#fdf2f1",
  amber:       "#b45309",
  amberLight:  "#fef3e2",
  mono:        "'DM Mono', monospace",
  sans:        "'Sora', sans-serif",
};

// ─────────────────────────────────────────────────────────────
//  MODAL WRAPPER
// ─────────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title:    string;
  onClose:  () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         50,
        background:     "rgba(10,18,6,0.60)",
        backdropFilter: "blur(4px)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   T.surface,
          borderRadius: 16,
          width:        "100%",
          maxWidth:     520,
          boxShadow:    "0 24px 64px rgba(10,18,6,0.22)",
          overflow:     "hidden",
          animation:    "kla-modal-in 0.2s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "20px 24px 16px",
            borderBottom:   `1px solid ${T.border}`,
          }}
        >
          <span
            style={{
              fontFamily: T.sans,
              fontWeight: 600,
              fontSize:   16,
              color:      T.text,
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background:     T.surfaceAlt,
              border:         `1px solid ${T.border}`,
              borderRadius:   "50%",
              width:          32,
              height:         32,
              cursor:         "pointer",
              fontSize:       18,
              color:          T.textMuted,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FILE DROP ZONE
// ─────────────────────────────────────────────────────────────
function FileDropZone({
  file,
  preview,
  onChange,
}: {
  file?:    File | null;
  preview?: string | null;
  onChange: (f: File) => void;
}) {
  const inputRef        = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onChange(f);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      style={{
        border:      `2px dashed ${drag ? T.greenAccent : T.border}`,
        borderRadius: 12,
        background:   drag ? T.greenLight : T.surfaceAlt,
        padding:      preview ? 8 : "32px 16px",
        cursor:       "pointer",
        textAlign:    "center",
        transition:   "all 0.2s",
        overflow:     "hidden",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            style={{
              width:        "100%",
              maxHeight:    200,
              objectFit:    "cover",
              borderRadius: 8,
              display:      "block",
            }}
          />
          <p
            style={{
              marginTop:  8,
              fontSize:   12,
              color:      T.textMuted,
              fontFamily: T.mono,
            }}
          >
            {file?.name ?? "Foto terpilih"} — klik untuk ganti
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
          <p
            style={{
              margin:     0,
              fontSize:   14,
              fontWeight: 500,
              color:      T.textMid,
              fontFamily: T.sans,
            }}
          >
            Klik atau seret foto ke sini
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: T.textMuted }}>
            PNG, JPG, WEBP — maks. 10 MB
          </p>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GALLERY FORM  (shared for create + edit)
// ─────────────────────────────────────────────────────────────
interface GalleryFormProps {
  initial?:  GalleryImage | null;
  onSubmit:  (payload: GalleryMutatePayload) => Promise<void>;
  onCancel:  () => void;
  isLoading: boolean;
}

function GalleryForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: GalleryFormProps) {
  const [title,    setTitle]    = useState(initial?.title     ?? "");
  const [caption,  setCaption]  = useState(initial?.caption   ?? "");
  const [order,    setOrder]    = useState(initial?.order     ?? 0);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(initial?.image ?? null);
  const [error,    setError]    = useState("");

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleSubmit = async () => {
    if (!title.trim())     return setError("Judul wajib diisi.");
    if (!initial && !file) return setError("Foto wajib dipilih.");
    setError("");
    await onSubmit({
      title:     title.trim(),
      caption:   caption.trim(),
      order,
      is_active: isActive,
      ...(file ? { image: file } : {}),
    });
  };

  const inputStyle: React.CSSProperties = {
    width:        "100%",
    padding:      "10px 12px",
    border:       `1px solid ${T.border}`,
    borderRadius: 8,
    fontSize:     14,
    fontFamily:   T.sans,
    color:        T.text,
    background:   T.surfaceAlt,
    outline:      "none",
    boxSizing:    "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display:       "block",
    fontSize:      12,
    fontWeight:    600,
    color:         T.textMuted,
    fontFamily:    T.mono,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom:  6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Drop zone */}
      <div>
        <span style={labelStyle}>
          {initial ? "Ganti Foto (opsional)" : "Foto *"}
        </span>
        <FileDropZone file={file} preview={preview} onChange={handleFile} />
      </div>

      {/* Title */}
      <div>
        <label style={labelStyle}>Judul *</label>
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="contoh: Petani Negeri"
          maxLength={120}
        />
      </div>

      {/* Caption */}
      <div>
        <label style={labelStyle}>Keterangan</label>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Deskripsi singkat foto (opsional)"
          maxLength={300}
        />
      </div>

      {/* Order + Status */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Urutan</label>
          <input
            style={inputStyle}
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            style={{
              width:        "100%",
              padding:      "10px 12px",
              border:       `1px solid ${isActive ? T.greenAccent : T.border}`,
              borderRadius: 8,
              background:   isActive ? T.greenLight : T.surfaceAlt,
              color:        isActive ? T.greenMid   : T.textMuted,
              fontSize:     13,
              fontFamily:   T.sans,
              fontWeight:   500,
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              transition:   "all 0.2s",
              boxSizing:    "border-box",
            }}
          >
            <div
              style={{
                width:        8,
                height:       8,
                borderRadius: "50%",
                background:   isActive ? T.greenAccent : T.border,
                flexShrink:   0,
              }}
            />
            {isActive ? "Aktif" : "Nonaktif"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            margin:       0,
            fontSize:     13,
            color:        T.danger,
            background:   T.dangerLight,
            padding:      "8px 12px",
            borderRadius: 8,
            fontFamily:   T.sans,
          }}
        >
          {error}
        </p>
      )}

      {/* Actions */}
      <div
        style={{
          display:         "flex",
          gap:             10,
          justifyContent:  "flex-end",
          paddingTop:      4,
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding:      "9px 20px",
            borderRadius: 8,
            border:       `1px solid ${T.border}`,
            background:   T.surfaceAlt,
            color:        T.textMid,
            fontSize:     14,
            fontFamily:   T.sans,
            cursor:       "pointer",
          }}
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            padding:      "9px 24px",
            borderRadius: 8,
            border:       "none",
            background:   isLoading ? T.border : T.green,
            color:        isLoading ? T.textMuted : "#fff",
            fontSize:     14,
            fontFamily:   T.sans,
            fontWeight:   600,
            cursor:       isLoading ? "not-allowed" : "pointer",
            transition:   "background 0.2s",
          }}
        >
          {isLoading
            ? "Menyimpan…"
            : initial
              ? "Simpan Perubahan"
              : "Unggah Foto"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  IMAGE CARD
// ─────────────────────────────────────────────────────────────
function ImageCard({
  image,
  index,
  onEdit,
  onDelete,
  onReorder,
}: {
  image:     GalleryImage;
  index:     number;
  onEdit:    (img: GalleryImage) => void;
  onDelete:  (img: GalleryImage) => void;
  onReorder: (id: string, order: number) => void;
}) {
  const [hovered,      setHovered]      = useState(false);
  const [editingOrder, setEditingOrder] = useState(false);
  const [orderVal,     setOrderVal]     = useState(String(image.order));

  const commitOrder = () => {
    const n = parseInt(orderVal, 10);
    if (!isNaN(n) && n !== image.order) onReorder(image.id, n);
    setEditingOrder(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   T.surface,
        borderRadius: 14,
        overflow:     "hidden",
        border:       `1px solid ${hovered ? T.greenAccent : T.border}`,
        boxShadow:    hovered
          ? "0 8px 32px rgba(45,74,20,0.14)"
          : "0 1px 4px rgba(45,74,20,0.06)",
        transition:   "all 0.25s",
        transform:    hovered ? "translateY(-2px)" : "none",
        animation:    "kla-fadeup 0.4s ease both",
        animationDelay: `${Math.min(index * 40, 400)}ms`,
      }}
    >
      {/* Image */}
      <div
        style={{
          position:    "relative",
          aspectRatio: "4/3",
          overflow:    "hidden",
          background:  T.surfaceAlt,
        }}
      >
        <img
          src={image.image}
          alt={image.title}
          style={{
            width:      "100%",
            height:     "100%",
            objectFit:  "cover",
            display:    "block",
            transition: "transform 0.4s",
            transform:  hovered ? "scale(1.05)" : "scale(1)",
          }}
        />

        {/* Active badge */}
        <div
          style={{
            position:   "absolute",
            top:        10,
            left:       10,
            background: image.is_active ? T.greenLight  : T.amberLight,
            color:      image.is_active ? T.greenMid    : T.amber,
            border:     `1px solid ${image.is_active ? "#b6dcaa" : "#f3c87e"}`,
            borderRadius: 50,
            padding:    "2px 10px",
            fontSize:   11,
            fontFamily: T.mono,
            fontWeight: 500,
          }}
        >
          {image.is_active ? "Aktif" : "Nonaktif"}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Title */}
        <p
          style={{
            margin:       "0 0 4px",
            fontSize:     14,
            fontWeight:   600,
            color:        T.text,
            fontFamily:   T.sans,
            overflow:     "hidden",
            whiteSpace:   "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {image.title || (
            <span style={{ color: T.textMuted, fontStyle: "italic" }}>
              Tanpa judul
            </span>
          )}
        </p>

        {/* Caption */}
        {image.caption && (
          <p
            style={{
              margin:              "0 0 12px",
              fontSize:            12,
              color:               T.textMuted,
              lineHeight:          1.5,
              overflow:            "hidden",
              display:             "-webkit-box",
              WebkitLineClamp:     2,
              WebkitBoxOrient:     "vertical",
            }}
          >
            {image.caption}
          </p>
        )}

        {/* Order + actions row */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            gap:            8,
            paddingTop:     10,
            borderTop:      `1px solid ${T.border}`,
            marginTop:      image.caption ? 0 : 12,
          }}
        >
          {/* Inline order editor */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize:   11,
                color:      T.textMuted,
                fontFamily: T.mono,
              }}
            >
              urutan
            </span>
            {editingOrder ? (
              <input
                autoFocus
                value={orderVal}
                onChange={(e) => setOrderVal(e.target.value)}
                onBlur={commitOrder}
                onKeyDown={(e) => e.key === "Enter" && commitOrder()}
                style={{
                  width:        44,
                  padding:      "2px 6px",
                  border:       `1px solid ${T.greenAccent}`,
                  borderRadius: 6,
                  fontSize:     12,
                  fontFamily:   T.mono,
                  color:        T.text,
                  background:   T.greenLight,
                  outline:      "none",
                }}
              />
            ) : (
              <button
                onClick={() => {
                  setOrderVal(String(image.order));
                  setEditingOrder(true);
                }}
                style={{
                  background:   T.surfaceAlt,
                  border:       `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding:      "2px 8px",
                  fontSize:     12,
                  fontFamily:   T.mono,
                  color:        T.textMid,
                  cursor:       "pointer",
                  minWidth:     36,
                }}
              >
                {image.order}
              </button>
            )}
          </div>

          {/* Edit / Delete */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onEdit(image)}
              style={{
                background:   T.greenLight,
                color:        T.greenMid,
                border:       "1px solid #b6dcaa",
                borderRadius: 8,
                padding:      "5px 14px",
                fontSize:     12,
                fontFamily:   T.sans,
                fontWeight:   500,
                cursor:       "pointer",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(image)}
              style={{
                background:   T.dangerLight,
                color:        T.danger,
                border:       "1px solid #f5c6c2",
                borderRadius: 8,
                padding:      "5px 14px",
                fontSize:     12,
                fontFamily:   T.sans,
                fontWeight:   500,
                cursor:       "pointer",
              }}
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DELETE CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────
function DeleteDialog({
  image,
  onConfirm,
  onCancel,
  isLoading,
}: {
  image:     GalleryImage;
  onConfirm: () => void;
  onCancel:  () => void;
  isLoading: boolean;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
      <p
        style={{
          fontFamily: T.sans,
          fontWeight: 600,
          fontSize:   16,
          color:      T.text,
          margin:     "0 0 8px",
        }}
      >
        Hapus foto ini?
      </p>
      <p
        style={{
          fontFamily: T.sans,
          fontSize:   14,
          color:      T.textMuted,
          margin:     "0 0 6px",
        }}
      >
        <strong style={{ color: T.text }}>
          {image.title || "Foto tanpa judul"}
        </strong>
      </p>
      <p
        style={{
          fontFamily: T.sans,
          fontSize:   13,
          color:      T.danger,
          margin:     "0 0 24px",
        }}
      >
        Tindakan ini tidak dapat dibatalkan.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          onClick={onCancel}
          style={{
            padding:      "9px 24px",
            borderRadius: 8,
            border:       `1px solid ${T.border}`,
            background:   T.surfaceAlt,
            color:        T.textMid,
            fontSize:     14,
            fontFamily:   T.sans,
            cursor:       "pointer",
          }}
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          style={{
            padding:      "9px 24px",
            borderRadius: 8,
            border:       "none",
            background:   isLoading ? T.border : T.danger,
            color:        isLoading ? T.textMuted : "#fff",
            fontSize:     14,
            fontFamily:   T.sans,
            fontWeight:   600,
            cursor:       isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Menghapus…" : "Ya, Hapus"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────

type ModalState =
  | { type: "create" }
  | { type: "edit";   image: GalleryImage }
  | { type: "delete"; image: GalleryImage }
  | null;

export default function GalleryPage() {
  const {
    images,
    isLoading,
    isError,
    refetch,
    create,
    update,
    replaceImage,
    reorder,
    remove,
  } = useGallery();

  const [modal,  setModal]  = useState<ModalState>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const closeModal = () => setModal(null);

  // Filtered + searched list
  const filtered = images.filter((img) => {
    const q = search.toLowerCase();
    const matchSearch =
      img.title.toLowerCase().includes(q) ||
      img.caption.toLowerCase().includes(q);
    const matchFilter =
      filter === "all"      ? true :
      filter === "active"   ? img.is_active :
                              !img.is_active;
    return matchSearch && matchFilter;
  });

  // ── Mutation handlers ──────────────────────────────────────
  const handleCreate = async (payload: GalleryMutatePayload) => {
    await create.mutateAsync(payload);
    closeModal();
  };

  const handleUpdate = async (payload: GalleryMutatePayload) => {
    if (modal?.type !== "edit") return;
    if (payload.image) {
      await replaceImage.mutateAsync({ id: modal.image.id, payload });
    } else {
      await update.mutateAsync({ id: modal.image.id, payload });
    }
    closeModal();
  };

  const handleDelete = async () => {
    if (modal?.type !== "delete") return;
    await remove.mutateAsync(modal.image.id);
    closeModal();
  };

  const handleReorder = (id: string, order: number) =>
    reorder.mutate({ id, order });

  // Stat counts
  const activeCount   = images.filter((i) => i.is_active).length;
  const inactiveCount = images.length - activeCount;

  return (
    <>
      {/* Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
      />

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans }}>

        {/* ══ PAGE HEADER ═══════════════════════════════════════ */}
        <div
          style={{
            background:   T.surface,
            borderBottom: `1px solid ${T.border}`,
            padding:      "24px 32px",
          }}
        >
          <div
            style={{
              maxWidth:       1200,
              margin:         "0 auto",
              display:        "flex",
              alignItems:     "flex-start",
              justifyContent: "space-between",
              gap:            16,
              flexWrap:       "wrap",
            }}
          >
            {/* Left — title */}
            <div>
              <div
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        6,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize:   12,
                    color:      T.textMuted,
                    fontFamily: T.mono,
                  }}
                >
                  CMS
                </span>
                <span style={{ fontSize: 12, color: T.border }}>›</span>
                <span
                  style={{
                    fontSize:   12,
                    color:      T.greenMid,
                    fontFamily: T.mono,
                    fontWeight: 500,
                  }}
                >
                  Galeri
                </span>
              </div>
              <h1
                style={{
                  margin:     0,
                  fontSize:   24,
                  fontWeight: 700,
                  color:      T.text,
                  lineHeight: 1.2,
                }}
              >
                Manajemen Galeri
              </h1>
              <p
                style={{
                  margin:   "4px 0 0",
                  fontSize: 13,
                  color:    T.textMuted,
                }}
              >
                Kelola foto galeri yang tampil di halaman publik.
              </p>
            </div>

            {/* Right — stat pills + add button */}
            <div
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        10,
                flexWrap:   "wrap",
              }}
            >
              {[
                { label: "Total",    val: images.length, color: T.textMuted, bg: T.surfaceAlt },
                { label: "Aktif",    val: activeCount,   color: T.greenMid,  bg: T.greenLight },
                { label: "Nonaktif", val: inactiveCount, color: T.amber,     bg: T.amberLight },
              ].map(({ label, val, color, bg }) => (
                <div
                  key={label}
                  style={{
                    background:  bg,
                    border:      `1px solid ${T.border}`,
                    borderRadius: 50,
                    padding:     "5px 14px",
                    display:     "flex",
                    alignItems:  "center",
                    gap:         6,
                  }}
                >
                  <span
                    style={{
                      fontSize:   16,
                      fontWeight: 700,
                      color,
                      fontFamily: T.mono,
                    }}
                  >
                    {val}
                  </span>
                  <span style={{ fontSize: 12, color: T.textMuted }}>
                    {label}
                  </span>
                </div>
              ))}

              <button
                onClick={() => setModal({ type: "create" })}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.opacity = "0.88")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.opacity = "1")
                }
                style={{
                  background:   T.green,
                  color:        "#fff",
                  border:       "none",
                  borderRadius: 10,
                  padding:      "10px 20px",
                  fontSize:     14,
                  fontFamily:   T.sans,
                  fontWeight:   600,
                  cursor:       "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          8,
                  boxShadow:    "0 2px 12px rgba(45,74,20,0.25)",
                  transition:   "opacity 0.2s",
                }}
              >
                <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
                Tambah Foto
              </button>
            </div>
          </div>
        </div>

        {/* ══ SEARCH + FILTER BAR ═══════════════════════════════ */}
        <div
          style={{
            maxWidth:   1200,
            margin:     "0 auto",
            padding:    "20px 32px 0",
            display:    "flex",
            gap:        12,
            flexWrap:   "wrap",
            alignItems: "center",
          }}
        >
          {/* Search input */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span
              style={{
                position:      "absolute",
                left:          12,
                top:           "50%",
                transform:     "translateY(-50%)",
                fontSize:      15,
                color:         T.textMuted,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              style={{
                width:        "100%",
                padding:      "9px 12px 9px 38px",
                border:       `1px solid ${T.border}`,
                borderRadius: 10,
                fontSize:     14,
                fontFamily:   T.sans,
                color:        T.text,
                background:   T.surface,
                outline:      "none",
                boxSizing:    "border-box",
              }}
              placeholder="Cari judul atau keterangan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display:      "flex",
              background:   T.surface,
              border:       `1px solid ${T.border}`,
              borderRadius: 10,
              overflow:     "hidden",
            }}
          >
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding:    "8px 18px",
                  border:     "none",
                  background: filter === f ? T.green : "transparent",
                  color:      filter === f ? "#fff" : T.textMuted,
                  fontSize:   13,
                  fontFamily: T.sans,
                  fontWeight: filter === f ? 600 : 400,
                  cursor:     "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f === "all"
                  ? "Semua"
                  : f === "active"
                    ? "Aktif"
                    : "Nonaktif"}
              </button>
            ))}
          </div>

          {/* Result count */}
          {!isLoading && (
            <span
              style={{
                fontSize:   12,
                color:      T.textMuted,
                fontFamily: T.mono,
                whiteSpace: "nowrap",
              }}
            >
              {filtered.length} foto
            </span>
          )}
        </div>

        {/* ══ GRID AREA ══════════════════════════════════════════ */}
        <div
          style={{
            maxWidth: 1200,
            margin:   "0 auto",
            padding:  "20px 32px 48px",
          }}
        >
          {/* Loading skeleton */}
          {isLoading && (
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap:                 20,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius:    14,
                    height:          300,
                    background:
                      "linear-gradient(110deg,#e4ead8 0%,#cdd6bc 45%,#e4ead8 100%)",
                    backgroundSize:  "200% 100%",
                    animation:       "kla-shimmer 1.8s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <p
                style={{
                  fontFamily:   T.sans,
                  color:        T.danger,
                  fontSize:     15,
                  marginBottom: 16,
                }}
              >
                Gagal memuat data galeri.
              </p>
              <button
                onClick={() => refetch()}
                style={{
                  background:   T.green,
                  color:        "#fff",
                  border:       "none",
                  borderRadius: 8,
                  padding:      "10px 24px",
                  fontFamily:   T.sans,
                  fontSize:     14,
                  cursor:       "pointer",
                }}
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
              <p
                style={{
                  fontFamily: T.sans,
                  fontSize:   16,
                  color:      T.textMid,
                  fontWeight: 600,
                  margin:     "0 0 6px",
                }}
              >
                {search || filter !== "all"
                  ? "Tidak ada foto yang cocok"
                  : "Belum ada foto"}
              </p>
              <p
                style={{
                  fontFamily: T.sans,
                  fontSize:   13,
                  color:      T.textMuted,
                  margin:     0,
                }}
              >
                {search || filter !== "all"
                  ? "Coba ubah filter atau kata kunci pencarian."
                  : 'Klik "Tambah Foto" untuk mulai mengisi galeri.'}
              </p>
            </div>
          )}

          {/* Image grid */}
          {!isLoading && !isError && filtered.length > 0 && (
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap:                 20,
              }}
            >
              {filtered.map((img, i) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  index={i}
                  onEdit={(image) => setModal({ type: "edit", image })}
                  onDelete={(image) => setModal({ type: "delete", image })}
                  onReorder={handleReorder}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════ */}

      {modal?.type === "create" && (
        <Modal title="Tambah Foto Baru" onClose={closeModal}>
          <GalleryForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            isLoading={create.isPending}
          />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Edit Foto" onClose={closeModal}>
          <GalleryForm
            initial={modal.image}
            onSubmit={handleUpdate}
            onCancel={closeModal}
            isLoading={update.isPending || replaceImage.isPending}
          />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal title="Konfirmasi Hapus" onClose={closeModal}>
          <DeleteDialog
            image={modal.image}
            onConfirm={handleDelete}
            onCancel={closeModal}
            isLoading={remove.isPending}
          />
        </Modal>
      )}

      {/* ══ GLOBAL KEYFRAMES ════════════════════════════════════ */}
      <style>{`
        @keyframes kla-shimmer {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes kla-fadeup {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes kla-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        * { box-sizing: border-box; }
      `}</style>
    </>
  );
}
