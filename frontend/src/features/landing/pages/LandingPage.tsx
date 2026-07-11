/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/features/landing/pages/LandingPage.tsx           ║
 * ║                                                              ║
 * ║  Navbar extracted to src/components/common/Navbar.tsx        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */
import { ArrowUpRight } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/common/Navbar";

const LOGO_SRC = "/Logo-KLA.png";
const HERO_BG  = "linear-gradient(160deg, #eef6e8 0%, #f3f8ee 50%, #f8faf6 100%)";

const SLIDES = [
  { src: "/branding/Branding01.jpeg", tag: "SOLUSI ANDALAN",  headline: "Semua Jenis Tanaman", accent: "#7ab648" },
  { src: "/branding/Branding02.jpeg", tag: "PUPUK TERBAIK",   headline: "Petani Negeri",       accent: "#c8952a" },
  { src: "/branding/Branding03.jpeg", tag: "PREMIUM QUALITY", headline: "KISA SIP Organik",    accent: "#7ab648" },
];

// ─────────────────────────────────────────────────────────────
//  COUNTER
// ─────────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = target / (1800 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString("id-ID")}{suffix}</>;
}

// ─────────────────────────────────────────────────────────────
//  HERO CAROUSEL
// ─────────────────────────────────────────────────────────────
function HeroCarousel() {
  const [active, setActive]       = useState(0);
  const [prev, setPrev]           = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (idx === active || animating) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setAnimating(true);
    setPrev(active);
    setActive(idx);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimating(true);
      setActive(n => {
        const next = (n + 1) % SLIDES.length;
        setPrev(n);
        setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
        return next;
      });
    }, 4500);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const current = SLIDES[active];

  return (
    <div className="hero-visual" style={{ position: "relative", userSelect: "none", width: "100%" }}>
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes progressSweep {
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
      `}</style>

      {/* Main frame */}
      <div style={{
        position:     "relative",
        borderRadius: 20,
        overflow:     "hidden",
        aspectRatio:  "3/4",
        maxHeight:    "calc(100vh - 180px)",
        background:   "#0d1f0a",
        boxShadow:    "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.14)",
      }}>
        {SLIDES.map((s, i) => (
          <img key={s.src} src={s.src} alt={s.headline} style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            opacity:    i === active ? 1 : 0,
            transform:  i === active ? "scale(1.0)" : "scale(1.04)",
            transition: i === active
              ? "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 5s ease"
              : "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s ease",
            zIndex: i === active ? 2 : i === prev ? 1 : 0,
          }} />
        ))}

        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "linear-gradient(to top, rgba(4,12,2,0.88) 0%, rgba(4,12,2,0.35) 38%, rgba(4,12,2,0.05) 62%, transparent 80%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "linear-gradient(to bottom, rgba(4,12,2,0.28) 0%, transparent 28%)" }} />

        {/* Top-left badge */}
        <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 40, padding: "5px 12px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: current.accent, boxShadow: `0 0 7px ${current.accent}99`, transition: "all 0.4s", flexShrink: 0 }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.82)", letterSpacing: "0.1em" }}>{current.tag}</span>
        </div>

        {/* Top-right cert */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", marginBottom: 2 }}>SERTIFIKASI</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7ab648" }}>✓ Organik</div>
        </div>

        {/* Bottom caption */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "22px 20px" }}>
          <div key={`tag-${active}`} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, color: current.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, animation: "slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            {current.tag}
          </div>
          <div key={`hl-${active}`} style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(16px,1.8vw,22px)", fontWeight: 400, color: "#fff", lineHeight: 1.25, marginBottom: 14, animation: "slideUp 0.5s 0.06s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            {current.headline}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ flex: i === active ? 3 : 1, height: 3, background: i === active ? current.accent : "rgba(255,255,255,0.22)", border: "none", borderRadius: 2, padding: 0, cursor: "pointer", transition: "flex 0.5s ease, background 0.4s ease", overflow: "hidden", position: "relative" }}>
                {i === active && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.35)", animation: "progressSweep 4.5s linear both", transformOrigin: "left" }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Arrows */}
        {([-1, 1] as const).map((dir) => (
          <button key={dir}
            onClick={() => goTo((active + dir + SLIDES.length) % SLIDES.length)}
            style={{ position: "absolute", top: "50%", [dir === -1 ? "left" : "right"]: 12, transform: "translateY(-50%)", zIndex: 10, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.32)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              {dir === -1 ? <polyline points="15,18 9,12 15,6" /> : <polyline points="9,18 15,12 9,6" />}
            </svg>
          </button>
        ))}
      </div>

      {/* Thumbnails */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center" }}>
        {SLIDES.map((s, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ width: 54, height: 54, borderRadius: 9, overflow: "hidden", border: `2.5px solid ${i === active ? current.accent : "transparent"}`, padding: 0, cursor: "pointer", opacity: i === active ? 1 : 0.45, transform: i === active ? "scale(1.07)" : "scale(1)", boxShadow: i === active ? "0 4px 14px rgba(0,0,0,0.18)" : "none", transition: "all 0.3s ease", flexShrink: 0 }}>
            <img src={s.src} alt={s.headline} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

const SOCIAL_MEDIA = [
  {
    name: "Facebook",
    description: "Komunitas & Informasi",
    url: "https://www.facebook.com/profile.php?id=100085858819480",
    icon: FaFacebookF,
    bg: "#eff6ff",
  },
  {
    name: "Instagram",
    description: "Foto & Aktivitas",
    url: "https://www.instagram.com/kusumalestariagro/",
    icon: FaInstagram,
    bg: "#fff1f7",
  },
  {
    name: "YouTube",
    description: "Video Edukasi",
    url: "https://www.youtube.com/@KusumaLestariAgro",
    icon: FaYoutube,
    bg: "#fef2f2",
  },
  {
    name: "TikTok",
    description: "Konten Singkat",
    url: "https://www.tiktok.com/@kusumalestariagro22",
    icon: FaTiktok,
    bg: "#f8fafc",
  },
];
// ─────────────────────────────────────────────────────────────
//  LANDING PAGE
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate              = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", background: "#fff", minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { from { background-position:-200% center; } to { background-position:200% center; } }

        .hero-badge   { animation: fadeIn  0.5s ease 0.05s both; }
        .hero-h1      { animation: fadeUp  0.6s ease 0.15s both; }
        .hero-body    { animation: fadeUp  0.6s ease 0.25s both; }
        .hero-tagline { animation: fadeUp  0.6s ease 0.32s both; }
        .hero-cta     { animation: fadeUp  0.6s ease 0.38s both; }
        .hero-visual  { animation: fadeIn  0.8s ease 0.20s both; }

        .kla-btn-primary {
          display: inline-flex; align-items: center;
          padding: 13px 28px; border-radius: 8px;
          background: #2d7a2d; color: #fff;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 15px; font-weight: 600;
          border: none; cursor: pointer;
          transition: background 0.18s, transform 0.18s;
          text-decoration: none;
        }
        .kla-btn-primary:hover { background: #1a5a1a; transform: translateY(-1px); }

        .kla-btn-outline {
          display: inline-flex; align-items: center;
          padding: 12px 26px; border-radius: 8px;
          background: transparent; color: #111;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 15px; font-weight: 600;
          border: 1.5px solid #d1d5db; cursor: pointer;
          transition: border-color 0.18s, background 0.18s;
          text-decoration: none;
        }
        .kla-btn-outline:hover { border-color: #9ca3af; background: rgba(0,0,0,0.03); }

        .kla-btn-login {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 10px;
          background: transparent; color: #111;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 15px; font-weight: 600;
          border: 1.5px solid #2d2d2d; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .kla-btn-login:hover { background: #1a3a12; color: #fff; border-color: #1a3a12; }

        .shimmer-text {
          background: linear-gradient(90deg,#1a5a1a 0%,#4a9a2a 40%,#c8952a 60%,#4a9a2a 80%,#1a5a1a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        .product-card {
          background:#fff; border-radius:14px; border:1px solid #e5e7eb; padding:28px 24px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .product-card:hover { box-shadow:0 12px 40px rgba(0,0,0,0.1); transform:translateY(-4px); }

        .feature-row { display:flex; gap:14px; align-items:flex-start; padding:18px 0; border-bottom:1px solid #f3f4f6; }
        .feature-row:last-child { border-bottom:none; }

        /* ── RESPONSIVE ── */

        /* Hero grid: 2 col desktop → 1 col mobile */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-visual {
            max-width: 420px;
            margin: 0 auto;
            width: 100%;
          }
        }

        /* Stats: 4 col → 2 col → 1 col */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
        }

        /* Products: 3 col → 1 col */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .products-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
        }
        @media (max-width: 600px) {
          .products-grid { grid-template-columns: 1fr; }
        }

        /* About: 2 col → 1 col */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
        }

        /* Footer: 4 col → 2 col → 1 col */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
          border-bottom: 1px solid #1e3a1e;
          padding-bottom: 40px;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr; gap: 28px; }
        }

        /* Footer bottom row */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        /* Section padding responsive */
        .section-pad  { padding: 88px clamp(16px, 5vw, 44px); }
        .section-pad-sm { padding: 40px clamp(16px, 5vw, 44px); }
      `}</style>

      {/* ── NAVBAR (extracted component) ── */}
      <Navbar scrolled={scrolled} />

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 68, background: HERO_BG, overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "40px clamp(16px, 5vw, 44px)" }}>
          <div className="hero-grid">

            {/* Left — text */}
            <div>
              <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.6)", border: "1px solid #c3e6b3", borderRadius: 24, padding: "5px 16px", marginBottom: 22 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2d7a2d", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1a5a1a", letterSpacing: "0.03em" }}>Produk Bersertifikasi Organik</span>
              </div>
              <h1 className="hero-h1" style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, lineHeight: 1.1, marginBottom: 16, color: "#111" }}>
                <span style={{ fontSize: "clamp(36px, 4.2vw, 58px)", display: "block" }}>Pupuk</span>
                <span className="shimmer-text" style={{ fontSize: "clamp(36px, 4.2vw, 58px)", display: "block", fontStyle: "italic", whiteSpace: "nowrap" }}>Organik Berkualitas</span>
                <span style={{ fontSize: "clamp(30px, 3.8vw, 52px)", display: "block" }}>Untuk Hasil Panen<br />Lebih Maksimal</span>
              </h1>
              <p className="hero-body" style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.75, marginBottom: 12, maxWidth: 430 }}>
                <strong style={{ color: "#111" }}>PT. Kusuma Lestari Agro</strong> menyediakan pupuk{" "}
                <strong style={{ color: "#1a5a1a" }}>organik berkualitas</strong> yang telah teruji di lapangan dan digunakan oleh berbagai petani serta distributor.
              </p>
              <p className="hero-tagline" style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: 16, color: "#1a5a1a", marginBottom: 24 }}>
                Berani diuji. Berani diteliti.
              </p>
              <div className="hero-cta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="#produk"  className="kla-btn-primary">Pelajari Produk</a>
                <a href="#kontak"  className="kla-btn-outline">Hubungi Kami</a>
              </div>
            </div>

            {/* Right — carousel */}
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#1a3a12" }} className="section-pad-sm">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="stats-grid">
            {[
              { label: "Petani & Distributor", value: 500, suffix: "+" },
              { label: "Tahun Pengalaman",     value: 15,  suffix: "+" },
              { label: "Produk Organik",       value: 20,  suffix: "+" },
              { label: "Provinsi Jangkauan",   value: 8,   suffix: ""  },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(32px,4vw,42px)", color: "#7ab648", lineHeight: 1, marginBottom: 6 }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#4a7a4a", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="produk" className="section-pad" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#2d7a2d", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Lini Produk Kami</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 400, color: "#111" }}>Produk Organik Berkualitas</h2>
          </div>
          <div className="products-grid">
            {[
              { icon: "🌱", name: "Pupuk Organik",  desc: "Formula organik untuk pertumbuhan optimal sepanjang musim tanam.",     tag: "Best Seller"  },
              { icon: "💧", name: "Pupuk Cair Organik",    desc: "Larutan nutrisi konsentrat langsung diserap akar untuk hasil cepat terlihat.",       tag: "Terlaris"     },
              { icon: "🌿", name: "Pupuk  KCL Plus",  desc: "KCL Plus adalah pupuk kalium berkualitas tinggi yang diformulasikan untuk memenuhi kebutuhan unsur hara kalium tanaman secara optimal.", tag: "Organik 100%" },
            ].map((p) => (
              <div key={p.name} className="product-card">
                <div style={{ fontSize: 32, marginBottom: 14 }}>{p.icon}</div>
                <div style={{ display: "inline-block", background: "#f0f7ec", borderRadius: 6, padding: "3px 10px", marginBottom: 10, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#1a5a1a", fontWeight: 600 }}>{p.tag}</div>
                <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19, fontWeight: 400, color: "#111", marginBottom: 10, lineHeight: 1.3 }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      {/* ── ABOUT / COMPANY PROFILE ── */}
<section
  id="tentang"
  className="section-pad"
  style={{ background: "#f8faf6" }}
>
  <div style={{ maxWidth: 1200, margin: "0 auto" }}>
    <div className="about-grid">

      {/* LEFT COLUMN */}
      <div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            color: "#c8952a",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Tentang Kami
        </div>

        <h2
          style={{
            fontFamily: "'DM Serif Display',serif",
            fontSize: "clamp(26px,3.2vw,40px)",
            fontWeight: 400,
            color: "#111",
            lineHeight: 1.25,
            marginBottom: 20,
          }}
        >
          Lebih dari 15 Tahun
          <br />
          <em style={{ color: "#1a5a1a" }}>Melayani Pertanian</em>
          <br />
          Indonesia
        </h2>

        <p
          style={{
            fontSize: 15,
            color: "#4b5563",
            lineHeight: 1.9,
            marginBottom: 16,
          }}
        >
          PT. Kusuma Lestari Agro hadir sebagai perusahaan yang
          berkomitmen menyediakan solusi pertanian organik yang efektif,
          berkelanjutan, dan terjangkau bagi petani Indonesia.
        </p>

        <p
          style={{
            fontSize: 15,
            color: "#4b5563",
            lineHeight: 1.9,
            marginBottom: 16,
          }}
        >
          Berbasis di Kabupaten Batanghari, Provinsi Jambi,
          kami melayani kebutuhan petani, kelompok tani,
          distributor, serta pelaku usaha pertanian di berbagai wilayah Indonesia.
        </p>

        <p
          style={{
            fontSize: 15,
            color: "#4b5563",
            lineHeight: 1.9,
          }}
        >
          Produk kami telah digunakan dan diuji di lapangan dengan
          fokus pada peningkatan produktivitas pertanian,
          kesehatan tanah, dan keberlanjutan lingkungan.
        </p>

        {/* LEGAL CARD */}
        <div
          style={{
            marginTop: 32,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              color: "#2d7a2d",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 18,
              fontWeight: 600,
            }}
          >
            Legalitas Perusahaan
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                Nomor AHU
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#111",
                }}
              >
                AHU-A005122.AH.01.31.Tahun 2026
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                Tanggal Pengesahan
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#111",
                }}
              >
                21 Mei 2026
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                NPWP Badan
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#111",
                }}
              >
                0615053956335000
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                Nomor Induk Berusaha (NIB)
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#111",
                }}
              >
                0111220026616
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div>

        {[
          {
            icon: "📍",
            title: "Alamat Perusahaan",
            desc:
              "Desa Pematang Gadung RT 001, Kecamatan Mersam, Kabupaten Batanghari, Provinsi Jambi 36654",
          },
          {
            icon: "✉️",
            title: "Email Center",
            desc:
              "kusumalestariagro22@gmail.com",
          },
          {
            icon: "📞",
            title: "Kontak Center",
            desc:
              "+62 xxx xxxx xxxx",
          },
          {
            icon: "🏢",
            title: "Legalitas Terdaftar",
            desc:
              "Perusahaan telah memiliki AHU, NPWP Badan, dan NIB yang sah sesuai ketentuan yang berlaku.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="feature-row"
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "#fff",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 4,
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {item.desc}
              </div>
            </div>
          </div>
        ))}

        {/* SOCIAL MEDIA */}
<div
  style={{
    marginTop: 32,
    background: "#ffffff",
    borderRadius: 20,
    border: "1px solid #e5e7eb",
    padding: 28,
    boxShadow: "0 10px 35px rgba(0,0,0,0.05)",
  }}
>
  <div
    style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11,
      color: "#2d7a2d",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      marginBottom: 12,
      fontWeight: 600,
    }}
  >
    Media Sosial Resmi
  </div>

  <h3
    style={{
      fontFamily: "'DM Serif Display', serif",
      fontSize: 30,
      lineHeight: 1.2,
      color: "#111827",
      marginBottom: 10,
      fontWeight: 400,
    }}
  >
    Tetap Terhubung
  </h3>

  <p
    style={{
      color: "#6b7280",
      fontSize: 15,
      lineHeight: 1.8,
      marginBottom: 24,
    }}
  >
    Ikuti aktivitas, edukasi pertanian, informasi produk terbaru,
    dan perkembangan PT. Kusuma Lestari Agro melalui kanal resmi kami.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 16,
    }}
  >
    {SOCIAL_MEDIA.map((social) => {
      const Icon = social.icon;

      return (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            background: social.bg,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-4px)";
            e.currentTarget.style.boxShadow =
              "0 14px 30px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                size={24}
                color="#1a5a1a"
              />
            </div>

            <ArrowUpRight
              size={18}
              color="#6b7280"
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              {social.name}
            </div>

            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              {social.description}
            </div>
          </div>
        </a>
      );
    })}
  </div>

  <div
    style={{
      marginTop: 24,
      paddingTop: 18,
      borderTop: "1px solid #eef2f7",
      fontSize: 13,
      color: "#6b7280",
      lineHeight: 1.7,
    }}
  >
    Informasi resmi PT. Kusuma Lestari Agro hanya dipublikasikan
    melalui kanal media sosial yang tercantum di atas.
  </div>
</div>
      </div>
    </div>
  </div>
</section>

      {/* ── DISTRIBUTOR ── */}
      <section id="distributor" className="section-pad" style={{ background: "#1a3a12", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: "radial-gradient(circle,rgba(122,182,72,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#7ab648", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Bergabung Sebagai</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 400, color: "#e8f0e8", lineHeight: 1.2, marginBottom: 18 }}>
            Mitra Distributor<br /><em style={{ color: "#7ab648" }}>PT. Kusuma Lestari Agro</em>
          </h2>
          <p style={{ color: "#6b9a6b", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
            Dapatkan akses ke produk berkualitas, margin kompetitif, dan dukungan penuh tim kami. Bergabung bersama 500+ mitra distributor di seluruh Indonesia.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {/* <a href="#kontak" className="kla-btn-primary" style={{ background: "#7ab648" }}>Daftar Sebagai Distributor</a> */}
            {/* <a href="#kontak" className="kla-btn-outline" style={{ borderColor: "#4a7a4a", color: "#7ab648" }}>Pelajari Lebih Lanjut</a> */}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="kontak" style={{ background: "#0d1f0a", padding: "52px clamp(16px,5vw,44px) 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: "#1e2d1e", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <img src={LOGO_SRC} alt="KLA" style={{ width: 20, height: 20, objectFit: "contain" }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#7ab648" }}>PT. Kusuma Lestari Agro</div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4a6a4a", maxWidth: 220 }}>Solusi pupuk organik terpercaya untuk pertanian Indonesia yang produktif dan berkelanjutan.</p>
            </div>
            {[
              { title: "Produk",     links: ["Pupuk Granul","Pupuk Cair","Kompos Premium","Paket Tanam"] },
              { title: "Perusahaan", links: ["Tentang Kami","Sertifikasi","Blog Pertanian"] },
              { title: "Kontak",     links: ["kusumalestariagro22@gmail.com","https://wa.me/6285367631881","Jambi, Indonesia"] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#7ab648", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600 }}>{col.title}</div>
                {col.links.map((l) => (
                  <div key={l} style={{ fontSize: 13, color: "#4a6a4a", marginBottom: 8, cursor: "pointer", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#7ab648")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#4a6a4a")}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: "#e8f0e8" }}>© 2025 PT. Kusuma Lestari Agro. Hak cipta dilindungi.</div>
            {/* <button className="kla-btn-login" onClick={() => navigate("/login")} style={{ borderColor: "#2a4a2a", color: "#4a7a4a", fontSize: 13 }}>
              Login Sistem Internal →
            </button> */}
          </div>
        </div>
      </footer>
    </div>
  );
}