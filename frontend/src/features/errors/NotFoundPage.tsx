/**
 * src/features/errors/NotFoundPage.tsx
 *
 * Fix: file was completely empty — React.lazy() requires a default export.
 */

import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight:      "100vh",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        background:     "#f4f6ef",
        fontFamily:     "'DM Sans', sans-serif",
        padding:        24,
        textAlign:      "center",
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>🌿</div>

      <h1
        style={{
          fontFamily: "'Lora', serif",
          fontSize:   48,
          fontWeight: 600,
          color:      "#2d4a14",
          margin:     "0 0 8px",
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize:   18,
          color:      "#4a5e38",
          margin:     "0 0 8px",
          fontWeight: 500,
        }}
      >
        Halaman tidak ditemukan
      </p>

      <p
        style={{
          fontSize:  14,
          color:     "#7a8f68",
          margin:    "0 0 32px",
          maxWidth:  360,
          lineHeight: 1.6,
        }}
      >
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>

      <Link
        to="/"
        style={{
          background:    "#2d4a14",
          color:         "#fff",
          padding:       "12px 28px",
          borderRadius:  50,
          textDecoration: "none",
          fontSize:      14,
          fontWeight:    600,
          transition:    "opacity 0.2s",
        }}
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
