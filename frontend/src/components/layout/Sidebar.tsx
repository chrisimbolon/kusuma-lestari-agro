import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NavLeaf, UserRole } from "../../config/navigation.config";
import { NAV_SECTIONS, flattenNavItems, isAllowed } from "../../config/navigation.config";

// ─────────────────────────────────────────────────────────────
//  ICON REGISTRY
//  Inline SVG icons — zero external dependency, perfect sizing
// ─────────────────────────────────────────────────────────────

const ICONS: Record<string, JSX.Element> = {
  dashboard:         <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>,
  quote:             <><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></>,
  "clipboard-list":  <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></>,
  truck:             <><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></>,
  "file-invoice":    <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></>,
  "wallet-in":       <><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 13h.01M12 3l4 4H8l4-4z"/></>,
  "wallet-out":      <><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 13h.01M12 17l-4-4h8l-4 4z"/></>,
  "return-left":     <><polyline points="9,14 4,9 9,4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></>,
  "return-right":    <><polyline points="15,14 20,9 15,4"/><path d="M4 20v-7a4 4 0 014-4h12"/></>,
  "users-group":     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
  "shopping-bag":    <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
  "package-check":   <><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/><polyline points="9,17 11,19 15,15"/></>,
  "file-text":       <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  "building-store":  <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></>,
  box:               <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  layers:            <><polygon points="12,2 2,7 12,12 22,7 12,2"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></>,
  warehouse:         <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"/></>,
  "arrows-exchange": <><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></>,
  "clipboard-check": <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></>,
  "chart-bar":       <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>,
  "list-tree":       <><path d="M21 12h-8M21 6H8M21 18h-8M3 6v4c0 1.1.9 2 2 2h2M3 6h4"/></>,
  "book-open":       <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>,
  book:              <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  scale:             <><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9 2 9-2"/><path d="M3 9c0 3.3 2.7 6 6 6s6-2.7 6-6M15 9c0 3.3 2.7 6 6 6s6-2.7 6-6" style={{transform:"scale(0.5) translate(12px,6px)"}}/></>,
  banknote:          <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></>,
  "git-compare":     <><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7M11 18H8a2 2 0 01-2-2V9"/></>,
  "arrow-down-circle": <><circle cx="12" cy="12" r="10"/><polyline points="8,12 12,16 16,12"/><line x1="12" y1="8" x2="12" y2="16"/></>,
  "arrow-up-circle":   <><circle cx="12" cy="12" r="10"/><polyline points="16,12 12,8 8,12"/><line x1="12" y1="16" x2="12" y2="8"/></>,
  "trending-up":     <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>,
  "trending-down":   <><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></>,
  package:           <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></>,
  landmark:          <><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12,2 20,7 4,7 12,2"/></>,
  "bar-chart-2":     <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  activity:          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>,
  receipt:           <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></>,
  "building-2":      <><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18zM6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/><line x1="10" y1="6" x2="10" y2="6.01"/><line x1="14" y1="6" x2="14" y2="6.01"/><line x1="10" y1="10" x2="10" y2="10.01"/><line x1="14" y1="10" x2="14" y2="10.01"/><line x1="10" y1="14" x2="10" y2="14.01"/><line x1="14" y1="14" x2="14" y2="14.01"/></>,
  "calendar-range":  <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
  percent:           <><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>,
  hash:              <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>,
  "shield-check":    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10"/></>,
  users:             <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
  "chevron-down":    <polyline points="6,9 12,15 18,9"/>,
  "chevron-right":   <polyline points="9,18 15,12 9,6"/>,
  menu:              <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:                 <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  leaf:              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>,
  logout:            <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
};

const Icon = ({ name, size = 15 }: { name: string; size?: number }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
    aria-hidden
  >
    {ICONS[name] ?? <circle cx="12" cy="12" r="10" />}
  </svg>
);

// ─────────────────────────────────────────────────────────────
//  BADGE CHIP
// ─────────────────────────────────────────────────────────────
const Badge = ({ type }: { type: "new" | "beta" | "critical" }) => {
  const map = {
    new:      { label: "New",    bg: "#2d5a27", color: "#86efac" },
    beta:     { label: "Beta",   bg: "#1e3a5f", color: "#93c5fd" },
    critical: { label: "!",      bg: "#5a1e1e", color: "#fca5a5" },
  };
  const { label, bg, color } = map[type];
  return (
    <span style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em",
      padding: "1px 5px", borderRadius: "3px",
      background: bg, color, fontFamily: "'IBM Plex Mono', monospace",
      textTransform: "uppercase", lineHeight: 1.6, flexShrink: 0,
    }}>
      {label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
//  PROPS
// ─────────────────────────────────────────────────────────────
interface SidebarProps {
  userRole?:    UserRole;
  userName?:    string;
  userInitials?: string;
  onLogout?:    () => void;
  collapsed?:   boolean;
  onCollapse?:  (v: boolean) => void;
}

// ─────────────────────────────────────────────────────────────
//  SIDEBAR COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Sidebar({
  userRole    = "admin",
  userName    = "Ahmad Kurnia",
  userInitials = "AK",
  onLogout,
  collapsed: controlledCollapsed,
  onCollapse,
}: SidebarProps) {
  const location = useLocation();
  const navigate  = useNavigate();

  const [collapsed, setCollapsed] = useState(controlledCollapsed ?? false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["penjualan"]));
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [mounted, setMounted]       = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // staggered mount animation
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // auto-open section containing the current path
  useEffect(() => {
    const current = flattenNavItems().find(i => location.pathname.startsWith(i.path));
    if (current) {
      for (const section of NAV_SECTIONS) {
        const found = section.items.some(item =>
          item.type === "leaf"
            ? item.key === current.key
            : item.children.some(c => c.key === current.key)
        );
        if (found) {
          setOpenSections(prev => new Set([...prev, section.sectionKey]));
          break;
        }
      }
    }
  }, [location.pathname]);

  const handleCollapse = (v: boolean) => {
    setCollapsed(v);
    onCollapse?.(v);
  };

  const toggleSection = (key: string) => {
    if (collapsed) { handleCollapse(false); return; }
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // CSS variables & tokens
  const css = {
    "--sidebar-w":       collapsed ? "68px" : "260px",
    "--bg":              "#111b11",
    "--bg-hover":        "#1a2a1a",
    "--bg-active":       "#1f3320",
    "--accent":          "#7ab648",
    "--accent-dim":      "#4a7a2a",
    "--gold":            "#c8952a",
    "--gold-dim":        "#8B6914",
    "--text-primary":    "#e8f0e8",
    "--text-secondary":  "#7a9a7a",
    "--text-dim":        "#4a6a4a",
    "--border":          "#1e2e1e",
    "--section-label":   "#3a5a3a",
  } as React.CSSProperties;

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');

        .kla-sidebar * { box-sizing: border-box; margin: 0; padding: 0; }

        .kla-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
          width: var(--sidebar-w);
          background: var(--bg);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          font-family: 'Instrument Sans', sans-serif;
          transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 2px 0 24px rgba(0,0,0,0.45);
          /* Subtle noise texture overlay */
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
        }

        /* ── Logo area ── */
        .kla-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 18px 16px 14px;
          border-bottom: 1px solid var(--border);
          min-height: 64px;
          position: relative;
          flex-shrink: 0;
        }
        .kla-logo-mark {
          width: 36px; height: 36px; border-radius: 9px;
          background: linear-gradient(135deg, #5a9a3a 0%, #3d7a28 100%);
          border: 1px solid #6aaa4a;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .kla-logo-text {
          opacity: 1;
          transition: opacity 0.2s ease;
          overflow: hidden; white-space: nowrap;
        }
        .kla-logo-text.hidden { opacity: 0; pointer-events: none; }
        .kla-logo-name {
          font-family: 'DM Serif Display', serif;
          font-size: 15px; font-weight: 400;
          color: var(--text-primary); letter-spacing: 0.01em;
          line-height: 1.2;
        }
        .kla-logo-sub {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; letter-spacing: 0.08em;
          color: var(--text-dim); text-transform: uppercase;
          margin-top: 1px;
        }
        .kla-collapse-btn {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; border-radius: 6px;
          background: transparent; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-dim);
          transition: all 0.15s ease;
          opacity: 0;
        }
        .kla-logo:hover .kla-collapse-btn { opacity: 1; }
        .kla-collapse-btn:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--accent-dim); }

        /* ── Scrollable nav area ── */
        .kla-nav {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 8px 0 12px;
          scrollbar-width: thin;
          scrollbar-color: #1e2e1e transparent;
        }
        .kla-nav::-webkit-scrollbar { width: 4px; }
        .kla-nav::-webkit-scrollbar-thumb { background: #1e3a1e; border-radius: 2px; }

        /* ── Section label ── */
        .kla-section-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--section-label);
          padding: 10px 18px 4px;
          white-space: nowrap; overflow: hidden;
          transition: opacity 0.2s ease;
          user-select: none;
        }
        .kla-section-label.collapsed { opacity: 0; height: 0; padding: 0; }
        .kla-section-divider {
          height: 1px; background: var(--border);
          margin: 6px 12px;
        }

        /* ── Nav items ── */
        .kla-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 0 10px; margin: 1px 6px;
          height: 36px; border-radius: 7px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.13s ease;
          white-space: nowrap; overflow: hidden;
          position: relative;
          user-select: none;
          text-decoration: none;
        }
        .kla-nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .kla-nav-item.active {
          background: var(--bg-active);
          color: var(--accent);
        }
        /* Active left indicator */
        .kla-nav-item.active::before {
          content: '';
          position: absolute; left: -6px; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 18px; border-radius: 0 2px 2px 0;
          background: var(--accent);
        }

        .kla-nav-icon {
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: color 0.13s ease;
        }
        .kla-nav-item.active .kla-nav-icon { color: var(--accent); }

        .kla-nav-label {
          font-size: 13px; font-weight: 500;
          letter-spacing: 0.01em;
          flex: 1; min-width: 0;
          overflow: hidden; text-overflow: ellipsis;
          transition: opacity 0.18s ease;
        }
        .kla-nav-label.hidden { opacity: 0; width: 0; }

        .kla-nav-meta {
          display: flex; align-items: center; gap: 5px;
          flex-shrink: 0;
          transition: opacity 0.18s ease;
        }
        .kla-nav-meta.hidden { opacity: 0; }

        /* ── Collapsed tooltip ── */
        .kla-tooltip {
          position: absolute; left: calc(100% + 10px); top: 50%;
          transform: translateY(-50%);
          background: #0d1a0d; border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 12px; font-weight: 500;
          padding: 5px 10px; border-radius: 6px;
          white-space: nowrap; pointer-events: none;
          box-shadow: 4px 4px 16px rgba(0,0,0,0.5);
          z-index: 200;
          opacity: 0; transition: opacity 0.12s ease;
        }
        .kla-tooltip::before {
          content: '';
          position: absolute; right: 100%; top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: var(--border);
        }
        .kla-nav-item:hover .kla-tooltip.show { opacity: 1; }

        /* ── Section header (toggle) ── */
        .kla-section-header {
          display: flex; align-items: center; gap: 10px;
          padding: 0 10px; margin: 1px 6px;
          height: 34px; border-radius: 7px;
          cursor: pointer;
          color: var(--text-dim);
          transition: all 0.13s ease;
          user-select: none;
        }
        .kla-section-header:hover { color: var(--text-secondary); }
        .kla-section-chevron {
          margin-left: auto; flex-shrink: 0;
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
          color: var(--text-dim);
        }
        .kla-section-chevron.open { transform: rotate(180deg); }

        /* ── Stagger animation on mount ── */
        .kla-animate {
          opacity: 0; transform: translateX(-6px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .kla-animate.mounted { opacity: 1; transform: translateX(0); }

        /* ── User footer ── */
        .kla-footer {
          border-top: 1px solid var(--border);
          padding: 10px 10px 12px;
          flex-shrink: 0;
        }
        .kla-user-card {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 8px; border-radius: 8px;
          cursor: default;
          transition: background 0.13s ease;
          overflow: hidden;
        }
        .kla-user-card:hover { background: var(--bg-hover); }
        .kla-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #2d5a1e, #1a3a12);
          border: 1px solid #3a5a2a;
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 600;
          color: var(--accent); flex-shrink: 0;
          letter-spacing: 0.03em;
        }
        .kla-user-info { flex: 1; min-width: 0; overflow: hidden; transition: opacity 0.18s ease; }
        .kla-user-info.hidden { opacity: 0; width: 0; }
        .kla-user-name {
          font-size: 12px; font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .kla-user-role {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--gold); margin-top: 1px;
        }
        .kla-logout-btn {
          width: 28px; height: 28px; border-radius: 6px;
          background: transparent; border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-dim); flex-shrink: 0;
          transition: all 0.13s ease;
        }
        .kla-logout-btn:hover { color: #f87171; border-color: #3a1e1e; background: #1e0e0e; }
      `}</style>

      <nav className="kla-sidebar" style={css}>

        {/* ── LOGO + COLLAPSE ── */}
        <div className="kla-logo">
          <div className="kla-logo-mark">
            <img src="/Logo-KLA.png" alt="KLA" style={{ width: 26, height: 26, objectFit: "contain", display: "block" }} />
          </div>
          <div className={`kla-logo-text ${collapsed ? "hidden" : ""}`}>
            <div className="kla-logo-name">Sistem KLA</div>
            <div className="kla-logo-sub">PT. Kurnia Lestari Agro</div>
          </div>
          <button className="kla-collapse-btn" onClick={() => handleCollapse(!collapsed)} title={collapsed ? "Expand" : "Collapse"}>
            <Icon name={collapsed ? "chevron-right" : "x"} size={12} />
          </button>
        </div>

        {/* ── NAVIGATION ── */}
        <div className="kla-nav" ref={scrollRef}>
          {NAV_SECTIONS.map((section, sectionIdx) => {
            // Filter items by role
            const visibleItems = section.items.filter(item =>
              item.type === "leaf" ? isAllowed(item, userRole) : true
            ) as NavLeaf[];

            if (visibleItems.length === 0) return null;

            const isOpen = openSections.has(section.sectionKey);

            return (
              <div
                key={section.sectionKey}
                className={`kla-animate ${mounted ? "mounted" : ""}`}
                style={{ transitionDelay: `${sectionIdx * 40}ms` }}
              >
                {/* Section divider (not for first section) */}
                {sectionIdx > 0 && section.sectionLabel && (
                  <div className="kla-section-divider" />
                )}

                {/* Section label */}
                {section.sectionLabel && (
                  <div
                    className={`kla-section-label ${collapsed ? "collapsed" : ""}`}
                    onClick={() => section.items.length > 1 && toggleSection(section.sectionKey)}
                  >
                    {section.sectionLabel}
                  </div>
                )}

                {/* Nav items */}
                {visibleItems.map((item, itemIdx) => {
                  const active = isActive(item.path);
                  return (
                    <div
                      key={item.key}
                      className={`kla-nav-item ${active ? "active" : ""} kla-animate ${mounted ? "mounted" : ""}`}
                      style={{ transitionDelay: `${sectionIdx * 40 + itemIdx * 25}ms` }}
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredKey(item.key)}
                      onMouseLeave={() => setHoveredKey(null)}
                      role="button" tabIndex={0}
                      onKeyDown={e => e.key === "Enter" && navigate(item.path)}
                    >
                      {/* Icon */}
                      <span className="kla-nav-icon">
                        <Icon name={item.icon} size={15} />
                      </span>

                      {/* Label */}
                      <span className={`kla-nav-label ${collapsed ? "hidden" : ""}`}>
                        {item.labelId}
                      </span>

                      {/* Badge */}
                      {item.badge && !collapsed && (
                        <span className={`kla-nav-meta ${collapsed ? "hidden" : ""}`}>
                          <Badge type={item.badge} />
                        </span>
                      )}

                      {/* Collapsed tooltip */}
                      {collapsed && (
                        <span className={`kla-tooltip ${hoveredKey === item.key ? "show" : ""}`}>
                          {item.labelId}
                          {item.badge && <> · <Badge type={item.badge} /></>}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── USER FOOTER ── */}
        <div className="kla-footer">
          <div className="kla-user-card">
            <div className="kla-avatar">{userInitials}</div>
            <div className={`kla-user-info ${collapsed ? "hidden" : ""}`}>
              <div className="kla-user-name">{userName}</div>
              <div className="kla-user-role">{userRole}</div>
            </div>
            {!collapsed && (
              <button className="kla-logout-btn" onClick={onLogout} title="Keluar">
                <Icon name="logout" size={14} />
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
