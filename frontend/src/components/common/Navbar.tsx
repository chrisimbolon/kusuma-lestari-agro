/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/components/common/Navbar.tsx                     ║
 * ║                                                               ║
 * ║  Extracted from LandingPage.tsx — now a proper component.    ║
 * ║  Responsive: desktop nav + mobile hamburger drawer.          ║
 * ║  Used by LandingPage.tsx (import and replace inline nav).    ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGO_SRC  = "/Logo-KLA.png";
const HERO_BG   = "linear-gradient(160deg, #eef6e8 0%, #f3f8ee 50%, #f8faf6 100%)";

const NAV_LINKS = [
  { label: "Produk Organik", href: "#produk"      },
  { label: "Tentang Kami",   href: "#tentang"     },
  { label: "Distributor",    href: "#distributor" },
];

interface NavbarProps {
  scrolled?: boolean;
}

export default function Navbar({ scrolled = false }: NavbarProps) {
  const navigate              = useNavigate();
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  const handleNavLink = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        .kla-nav-link {
          color: #374151; font-size: 15px; font-weight: 400;
          text-decoration: none; transition: color 0.15s; cursor: pointer;
          background: none; border: none; font-family: inherit;
        }
        .kla-nav-link:hover { color: #1a3a12; }

        .kla-btn-login {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 10px;
          background: transparent; color: #111;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 15px; font-weight: 600;
          border: 1.5px solid #2d2d2d; cursor: pointer;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .kla-btn-login:hover { background: #1a3a12; color: #fff; border-color: #1a3a12; }

        /* Hamburger lines */
        .ham-line {
          display: block; width: 22px; height: 2px;
          background: #1a2e1a; border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          transform-origin: center;
        }
        .ham-open .ham-line:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .ham-open .ham-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .ham-open .ham-line:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile drawer */
        .kla-mobile-drawer {
          position: fixed; inset: 0; top: 68px; z-index: 99;
          background: rgba(255,255,255,0.98); backdrop-filter: blur(12px);
          display: flex; flex-direction: column;
          padding: 32px 28px 40px;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .kla-mobile-drawer.is-open { transform: translateX(0); }

        .kla-mobile-link {
          font-family: 'Instrument Sans', sans-serif;
          font-size: 22px; font-weight: 500; color: #1a2e1a;
          text-decoration: none; padding: 16px 0;
          border-bottom: 1px solid #f0f0ec;
          display: block; cursor: pointer;
          background: none; border-left: none; border-right: none; border-top: none;
          text-align: left; width: 100%;
          transition: color 0.15s, padding-left 0.15s;
        }
        .kla-mobile-link:hover { color: #2d7a2d; padding-left: 8px; }

        @media (min-width: 768px) {
          .kla-hamburger { display: none !important; }
          .kla-desktop-links { display: flex !important; }
        }
        @media (max-width: 767px) {
          .kla-desktop-links { display: none !important; }
        }
      `}</style>

      {/* ── Main nav bar ── */}
      <nav style={{
        position:       "fixed",
        top: 0, left: 0, right: 0,
        zIndex:         100,
        height:         68,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 clamp(16px, 4vw, 44px)",
        background:     scrolled ? "rgba(255,255,255,0.96)" : HERO_BG,
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom:   scrolled ? "1px solid #e5e7eb" : "1px solid transparent",
        transition:     "background 0.35s ease, border-color 0.35s ease",
        opacity:        mounted ? 1 : 0,
      }}>

        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer", flexShrink: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}>
            <img src={LOGO_SRC} alt="KLA Logo" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{
              fontFamily:    "'Instrument Sans', sans-serif",
              fontSize:      "clamp(12px, 2vw, 15px)",
              fontWeight:    700,
              color:         "#1a2e1a",
              lineHeight:    1.2,
              letterSpacing: "-0.01em",
            }}>
              PT. Kusuma Lestari Agro
            </div>
            <div style={{
              fontFamily:    "'IBM Plex Mono', monospace",
              fontSize:      9,
              fontWeight:    500,
              color:         "#6b8f6b",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop:     1,
            }}>
              Pupuk Organik
            </div>
          </div>
        </div>

        {/* ── Desktop links ── */}
        <div
          className="kla-desktop-links"
          style={{ alignItems: "center", gap: 36 }}
        >
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="kla-nav-link">{l.label}</a>
          ))}
          <Link to="/gallery" className="kla-nav-link" style={{ fontWeight: 600 }}>
            Gallery
          </Link>
          <button className="kla-btn-login" onClick={() => navigate("/login")}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login
          </button>
        </div>

        {/* ── Hamburger (mobile only) ── */}
        <button
          className={`kla-hamburger ${open ? "ham-open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          style={{
            display:        "flex",
            flexDirection:  "column",
            gap:            5,
            background:     "none",
            border:         "none",
            cursor:         "pointer",
            padding:        8,
            borderRadius:   8,
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <span className="ham-line" />
          <span className="ham-line" />
          <span className="ham-line" />
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`kla-mobile-drawer ${open ? "is-open" : ""}`}>

        {NAV_LINKS.map((l, i) => (
          <button
            key={l.label}
            className="kla-mobile-link"
            onClick={() => handleNavLink(l.href)}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {l.label}
          </button>
        ))}

        <Link
          to="/gallery"
          className="kla-mobile-link"
          style={{ fontWeight: 600, color: "#2d7a2d" }}
          onClick={() => setOpen(false)}
        >
          Gallery
        </Link>

        {/* Login button at bottom of drawer */}
        <div style={{ marginTop: "auto", paddingTop: 32 }}>
          <button
            onClick={() => { setOpen(false); navigate("/login"); }}
            style={{
              width:          "100%",
              padding:        "15px 24px",
              background:     "#1a3a12",
              color:          "#fff",
              border:         "none",
              borderRadius:   12,
              fontFamily:     "'Instrument Sans', sans-serif",
              fontSize:       16,
              fontWeight:     600,
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            10,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login ke Sistem
          </button>

          {/* Brand footer */}
          <p style={{
            textAlign:     "center",
            marginTop:     20,
            fontSize:      12,
            color:         "#9ca3af",
            fontFamily:    "'IBM Plex Mono', monospace",
            letterSpacing: "0.05em",
          }}>
            PT. KUSUMA LESTARI AGRO
          </p>
        </div>
      </div>

      {/* Backdrop — tap outside to close */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:   "fixed",
            inset:      0,
            top:        68,
            zIndex:     98,
            background: "rgba(0,0,0,0.2)",
          }}
        />
      )}
    </>
  );
}