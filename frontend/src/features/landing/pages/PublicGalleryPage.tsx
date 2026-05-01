/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/landing/pages/PublicGalleryPage.tsx     ║
 * ║                                                               ║
 * ║  Fix: import api from "@/lib/axios"  (was "../../lib/axios") ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import api from "@/lib/axios"; // ← THE FIX
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

interface GalleryImage {
  id:         string;
  title:      string;
  caption:    string;
  image:      string;
  is_active:  boolean;
  order:      number;
  created_at: string;
}

interface GalleryListResponse {
  count:   number;
  next:    string | null;
  results: GalleryImage[];
}

// ─────────────────────────────────────────────────────────────
//  URL NORMALISER
// ─────────────────────────────────────────────────────────────

const BACKEND = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function normaliseUrl(raw: string): string {
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

async function fetchGallery(): Promise<GalleryImage[]> {
  const { data } = await api.get<GalleryListResponse>("/api/cms/gallery/");
  return data.results
    .filter((img) => img.is_active)
    .sort((a, b) => a.order - b.order)
    .map((img) => ({ ...img, image: normaliseUrl(img.image) }));
}

const GALLERY_KEY = ["public-gallery"] as const;

// ─────────────────────────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────────────────────────

function SkeletonCard({ h }: { h: number }) {
  return (
    <div style={{
      height: h, borderRadius: 16, marginBottom: 16, breakInside: "avoid",
      background: "linear-gradient(110deg,#e4ead8 0%,#cdd6bc 45%,#e4ead8 100%)",
      backgroundSize: "200% 100%",
      animation: "kla-shimmer 1.8s ease-in-out infinite",
    }} />
  );
}

const SKELETON_HEIGHTS = [220, 300, 180, 260, 200, 340, 190, 270, 210];

// ─────────────────────────────────────────────────────────────
//  LIGHTBOX
// ─────────────────────────────────────────────────────────────

function Lightbox({ images, index, onClose, onNavigate }: {
  images: GalleryImage[]; index: number;
  onClose: () => void; onNavigate: (i: number) => void;
}) {
  const img     = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")                onClose();
      if (e.key === "ArrowLeft"  && hasPrev) onNavigate(index - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    (strip.children[index] as HTMLElement)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  if (!img) return null;

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    flexShrink: 0, width: 44, height: 44, borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.12)", fontSize: 24,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: disabled ? "transparent" : "rgba(255,255,255,0.09)",
    color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
    cursor: disabled ? "default" : "pointer", transition: "background 0.2s",
  });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(8,13,6,0.94)", backdropFilter: "blur(8px)", padding: "0 16px" }}>

      {/* Counter + close */}
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 880, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <button onClick={onClose} style={{ ...navBtn(false), fontSize: 20, background: "rgba(255,255,255,0.07)" }}>×</button>
      </div>

      {/* Image + prev/next */}
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 880, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => hasPrev && onNavigate(index - 1)} disabled={!hasPrev} style={navBtn(!hasPrev)}>‹</button>
        <div style={{ flex: 1, borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.7)", background: "#0d140a", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: "66vh" }}>
          <img key={img.id} src={img.image} alt={img.title || ""} style={{ width: "100%", maxHeight: "66vh", objectFit: "contain", display: "block", animation: "kla-lb-in 0.22s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
        <button onClick={() => hasNext && onNavigate(index + 1)} disabled={!hasNext} style={navBtn(!hasNext)}>›</button>
      </div>

      {/* Caption */}
      {(img.title || img.caption) && (
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 880, padding: "14px 56px 0", textAlign: "center" }}>
          {img.title   && <p style={{ margin: 0, color: "#fff", fontSize: 16, fontFamily: "'Lora', serif", fontWeight: 500 }}>{img.title}</p>}
          {img.caption && <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.42)", fontSize: 13, lineHeight: 1.6 }}>{img.caption}</p>}
        </div>
      )}

      {/* Thumbnails */}
      <div ref={stripRef} onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 8, marginTop: 20, overflowX: "auto", maxWidth: 880, width: "100%", paddingBottom: 4, scrollbarWidth: "none" }}>
        {images.map((t, i) => (
          <button key={t.id} onClick={() => onNavigate(i)} style={{ flexShrink: 0, width: 58, height: 44, borderRadius: 8, overflow: "hidden", border: i === index ? "2px solid #6abf3f" : "2px solid transparent", opacity: i === index ? 1 : 0.38, cursor: "pointer", padding: 0, background: "transparent" }}>
            <img src={t.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GALLERY CARD
// ─────────────────────────────────────────────────────────────

function GalleryCard({ image, index, onClick }: { image: GalleryImage; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [loaded,  setLoaded]  = useState(false);

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ breakInside: "avoid", marginBottom: 16, borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative", background: "#d4dbc9", boxShadow: hovered ? "0 16px 48px rgba(45,74,20,0.22)" : "0 2px 12px rgba(45,74,20,0.08)", transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s", animation: "kla-fadeup 0.5s ease both", animationDelay: `${Math.min(index * 55, 480)}ms` }}
    >
      <img src={image.image} alt={image.title || "Galeri KLA"} loading="lazy" onLoad={() => setLoaded(true)}
        style={{ display: "block", width: "100%", objectFit: "cover", transition: "transform 0.5s, opacity 0.4s", transform: hovered ? "scale(1.06)" : "scale(1)", opacity: loaded ? 1 : 0 }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18,32,8,0.88) 0%, rgba(18,32,8,0.2) 50%, transparent 100%)", opacity: hovered ? 1 : 0, transition: "opacity 0.3s", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16 }}>
        {image.title   && <p style={{ margin: 0, color: "#fff", fontSize: 14, fontFamily: "'Lora', serif", fontWeight: 500 }}>{image.title}</p>}
        {image.caption && <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 12, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{image.caption}</p>}
        <div style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", transform: hovered ? "scale(1)" : "scale(0.7)", opacity: hovered ? 1 : 0, transition: "transform 0.25s, opacity 0.25s" }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5H5M1.5 1.5V5M1.5 1.5L5.5 5.5M11.5 1.5H8M11.5 1.5V5M11.5 1.5L7.5 5.5M1.5 11.5H5M1.5 11.5V8M1.5 11.5L5.5 7.5M11.5 11.5H8M11.5 11.5V8M11.5 11.5L7.5 7.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────

export default function PublicGalleryPage() {
  const { data: images = [], isLoading, isError, refetch } = useQuery({
    queryKey: GALLERY_KEY,
    queryFn:  fetchGallery,
    staleTime: 1000 * 60 * 5,
    retry:     2,
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const openLightbox  = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navigate      = useCallback((i: number) => setLightboxIndex(i), []);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap" />

      <div style={{ minHeight: "100vh", background: "#f4f6ef", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Hero */}
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg,#1e3510 0%,#2d4a14 45%,#3a5c1a 100%)", padding: "80px 24px 64px" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 24, height: 1, background: "#6abf3f", opacity: 0.7 }} />
              <span style={{ color: "#8ed45c", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase" }}>PT. Kusuma Lestari Agro</span>
            </div>
            <h1 style={{ margin: "0 0 16px", color: "#fff", fontSize: "clamp(32px,5vw,52px)", fontFamily: "'Lora', serif", fontWeight: 600, lineHeight: 1.18 }}>Galeri Kami</h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 15, maxWidth: 480, lineHeight: 1.75 }}>Dokumentasi perjalanan, produk unggulan, dan momen kebersamaan bersama para petani serta distributor kami di seluruh Indonesia.</p>
            {!isLoading && !isError && images.length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "5px 14px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6abf3f" }} />
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>{images.length} foto</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 24, background: "#f4f6ef" }} />

        {/* Grid */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 64px" }}>
          {isLoading && (
            <div style={{ columns: 1 }} className="pg-cols">
              {SKELETON_HEIGHTS.map((h, i) => <SkeletonCard key={i} h={h} />)}
            </div>
          )}
          {isError && (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#2d4a14", margin: "0 0 8px", fontWeight: 600 }}>Gagal memuat galeri</p>
              <button onClick={() => refetch()} style={{ background: "#2d4a14", color: "#fff", border: "none", borderRadius: 50, padding: "10px 28px", fontSize: 14, cursor: "pointer", marginTop: 16 }}>Coba lagi</button>
            </div>
          )}
          {!isLoading && !isError && images.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#2d4a14", margin: "0 0 8px", fontWeight: 600 }}>Galeri belum tersedia</p>
            </div>
          )}
          {!isLoading && !isError && images.length > 0 && (
            <div style={{ columns: 1, columnGap: 16 }} className="pg-cols">
              {images.map((img, i) => <GalleryCard key={img.id} image={img} index={i} onClick={() => openLightbox(i)} />)}
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} onNavigate={navigate} />}

      <style>{`
        @media(min-width:640px)  { .pg-cols { columns: 2 !important; } }
        @media(min-width:1024px) { .pg-cols { columns: 3 !important; } }
        @keyframes kla-shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes kla-fadeup  { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes kla-lb-in   { from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
