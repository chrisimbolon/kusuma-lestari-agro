import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NavLeaf, UserRole } from "../../config/navigation.config";
import { NAV_SECTIONS, flattenNavItems, isAllowed } from "../../config/navigation.config";

// ─────────────────────────────────────────────────────────────
//  ICON REGISTRY
//  Fix: JSX.Element → React.ReactNode (no JSX namespace needed)
// ─────────────────────────────────────────────────────────────

const ICONS: Record<string, React.ReactNode> = {
  dashboard:           <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>,
  quote:               <><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></>,
  "clipboard-list":    <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></>,
  truck:               <><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></>,
  "file-invoice":      <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></>,
  "wallet-in":         <><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 13h.01M12 3l4 4H8l4-4z"/></>,
  "wallet-out":        <><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 13h.01M12 17l-4-4h8l-4 4z"/></>,
  "return-left":       <><polyline points="9,14 4,9 9,4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></>,
  "return-right":      <><polyline points="15,14 20,9 15,4"/><path d="M4 20v-7a4 4 0 014-4h12"/></>,
  "users-group":       <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
  "shopping-bag":      <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
  "package-check":     <><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/><polyline points="9,17 11,19 15,15"/></>,
  "file-text":         <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  "building-store":    <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></>,
  box:                 <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  layers:              <><polygon points="12,2 2,7 12,12 22,7 12,2"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></>,
  warehouse:           <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10"/></>,
  "arrows-exchange":   <><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></>,
  "clipboard-check":   <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></>,
  "chart-bar":         <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>,
  "list-tree":         <><path d="M21 12h-8M21 6H8M21 18h-8M3 6v4c0 1.1.9 2 2 2h2M3 6h4"/></>,
  "book-open":         <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>,
  book:                <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  banknote:            <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></>,
  "git-compare":       <><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 012 2v7M11 18H8a2 2 0 01-2-2V9"/></>,
  "arrow-down-circle": <><circle cx="12" cy="12" r="10"/><polyline points="8,12 12,16 16,12"/><line x1="12" y1="8" x2="12" y2="16"/></>,
  "arrow-up-circle":   <><circle cx="12" cy="12" r="10"/><polyline points="16,12 12,8 8,12"/><line x1="12" y1="16" x2="12" y2="8"/></>,
  "trending-up":       <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>,
  "trending-down":     <><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></>,
  package:             <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></>,
  landmark:            <><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12,2 20,7 4,7 12,2"/></>,
  "bar-chart-2":       <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  activity:            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>,
  receipt:             <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></>,
  "building-2":        <><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18zM6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/><line x1="10" y1="6" x2="10" y2="6.01"/><line x1="14" y1="6" x2="14" y2="6.01"/><line x1="10" y1="10" x2="10" y2="10.01"/><line x1="14" y1="10" x2="14" y2="10.01"/><line x1="10" y1="14" x2="10" y2="14.01"/><line x1="14" y1="14" x2="14" y2="14.01"/></>,
  "calendar-range":    <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
  percent:             <><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>,
  hash:                <><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></>,
  "shield-check":      <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9,12 11,14 15,10"/></>,
  users:               <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
  "chevron-down":      <polyline points="6,9 12,15 18,9"/>,
  "chevron-right":     <polyline points="9,18 15,12 9,6"/>,
  menu:                <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:                   <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  leaf:                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>,
  logout:              <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  scale:               <><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9 2 9-2"/></>,
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

const Badge = ({ type }: { type: "new" | "beta" | "critical" }) => {
  const map = {
    new:      { label: "New",  bg: "#2d5a27", color: "#86efac" },
    beta:     { label: "Beta", bg: "#1e3a5f", color: "#93c5fd" },
    critical: { label: "!",   bg: "#5a1e1e", color: "#fca5a5" },
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

interface SidebarProps {
  userRole?:     UserRole;
  userName?:     string;
  userInitials?: string;
  onLogout?:     () => void;
  collapsed?:    boolean;
  onCollapse?:   (v: boolean) => void;
}

export default function Sidebar({
  userRole     = "admin",
  userName     = "Ahmad Kurnia",
  userInitials = "AK",
  onLogout,
  collapsed:   controlledCollapsed,
  onCollapse,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed,     setCollapsed]     = useState(controlledCollapsed ?? false);
  const [openSections,  setOpenSections]  = useState<Set<string>>(new Set(["penjualan"]));
  const [hoveredKey,    setHoveredKey]    = useState<string | null>(null);
  const [mounted,       setMounted]       = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

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

  // ── Render nav leaf ──────────────────────────────────────────
  const renderLeaf = (item: NavLeaf, depth = 0) => {
    if (!isAllowed(item, userRole ?? "staff")) return null;
    const isActive  = location.pathname === item.path ||
                      location.pathname.startsWith(item.path + "/");
    const isHovered = hoveredKey === item.key;

    return (
      <div
        key={item.key}
        onClick={() => navigate(item.path)}
        onMouseEnter={() => setHoveredKey(item.key)}
        onMouseLeave={() => setHoveredKey(null)}
        style={{
          display:     "flex",
          alignItems:  "center",
          gap:         10,
          padding:     collapsed ? "10px 0" : depth > 0 ? "8px 16px 8px 44px" : "9px 16px",
          marginBottom: 2,
          borderRadius: 10,
          cursor:       "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          background:   isActive
            ? "rgba(134,239,172,0.13)"
            : isHovered
              ? "rgba(255,255,255,0.06)"
              : "transparent",
          transition:  "background 0.15s",
          position:    "relative",
        }}
      >
        {isActive && (
          <div style={{
            position: "absolute", left: 0, top: "20%", bottom: "20%",
            width: 3, borderRadius: "0 3px 3px 0", background: "#86efac",
          }} />
        )}
        <span style={{ color: isActive ? "#86efac" : isHovered ? "#d4f5d4" : "#a8c5a0", lineHeight: 0 }}>
          <Icon name={item.icon} size={16} />
        </span>
        {!collapsed && (
          <>
            <span style={{
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? "#e8f5e8" : "#c8dcc8",
              flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {item.labelId}
            </span>
            {item.badge && <Badge type={item.badge} />}
          </>
        )}
      </div>
    );
  };

  const W = collapsed ? 68 : 260;

  return (
    <aside style={{
      position:   "fixed",
      top: 0, left: 0, bottom: 0,
      width:      W,
      background: "#1a2e1a",
      display:    "flex",
      flexDirection: "column",
      zIndex:     40,
      transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
      overflow:   "hidden",
      opacity:    mounted ? 1 : 0,
      transform:  mounted ? "none" : "translateX(-8px)",
    }}>

      {/* ── Logo ── */}
      <div style={{
        height: 64, display: "flex", alignItems: "center",
        padding: collapsed ? "0" : "0 20px",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, overflow: "hidden",
              flexShrink: 0, background: "#2d4a14",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src="/Logo-KLA.png" alt="KLA" style={{ width: 24, height: 24, objectFit: "contain" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e8f5e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Sistem KLA
              </div>
              <div style={{ fontSize: 10, color: "#6a8a6a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                PT. Kurnia Lestari Agro
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => handleCollapse(!collapsed)}
          style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: 7, width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6a8a6a", flexShrink: 0,
          }}
        >
          <Icon name={collapsed ? "chevron-right" : "menu"} size={14} />
        </button>
      </div>

      {/* ── Nav ── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "12px 8px" : "12px 10px" }}>
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(item =>
            item.type === "leaf"
              ? isAllowed(item, userRole ?? "staff")
              : item.children.some(c => isAllowed(c, userRole ?? "staff"))
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.sectionKey} style={{ marginBottom: 8 }}>
              {section.sectionLabel && !collapsed && (
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  color: "#4a6a4a", textTransform: "uppercase",
                  padding: "8px 16px 4px", userSelect: "none",
                }}>
                  {section.sectionLabel}
                </div>
              )}
              {visibleItems.map(item =>
                item.type === "leaf"
                  ? renderLeaf(item)
                  : (
                    <div key={item.key}>
                      <div
                        onClick={() =>
                          setOpenSections(prev => {
                            const next = new Set(prev);
                            next.has(section.sectionKey) ? next.delete(section.sectionKey) : next.add(section.sectionKey);
                            return next;
                          })
                        }
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: collapsed ? "10px 0" : "9px 16px",
                          borderRadius: 10, cursor: "pointer",
                          justifyContent: collapsed ? "center" : "flex-start",
                          color: "#a8c5a0",
                        }}
                      >
                        <Icon name={item.icon} size={16} />
                        {!collapsed && (
                          <>
                            <span style={{ flex: 1, fontSize: 13, color: "#c8dcc8" }}>{item.labelId}</span>
                            <Icon name="chevron-down" size={13} />
                          </>
                        )}
                      </div>
                      {openSections.has(section.sectionKey) && !collapsed &&
                        item.children.map(child => renderLeaf(child, 1))
                      }
                    </div>
                  )
              )}
            </div>
          );
        })}
      </div>

      {/* ── User footer ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: collapsed ? "12px 8px" : "12px 16px",
        display: "flex", alignItems: "center",
        gap: 10, flexShrink: 0,
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg,#2d5a27,#4a8a42)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#e8f5e8", flexShrink: 0,
        }}>
          {userInitials}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e8f5e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userName}
              </div>
              <div style={{ fontSize: 10, color: "#6a8a6a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {userRole}
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#6a8a6a", padding: 4, borderRadius: 6,
                  display: "flex", alignItems: "center",
                }}
              >
                <Icon name="logout" size={15} />
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
