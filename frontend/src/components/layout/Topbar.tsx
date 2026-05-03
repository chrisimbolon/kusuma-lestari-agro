/**
 * src/components/layout/Topbar.tsx
 * Fix: removed unused `sidebarCollapsed` prop — TS6133
 */

import { useLocation } from "react-router-dom";
import { findNavItemByPath } from "../../config/navigation.config";

export default function Topbar() {   // ← prop removed entirely
  const location = useLocation();
  const navItem  = findNavItemByPath(location.pathname);

  return (
    <header
      style={{
        height:       56,
        background:   "#ffffff",
        borderBottom: "1px solid #e8e2d8",
        display:      "flex",
        alignItems:   "center",
        padding:      "0 28px",
        gap:          12,
        flexShrink:   0,
        fontFamily:   "'Instrument Sans', sans-serif",
      }}
    >
      <div style={{ flex: 1 }}>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize:   18,
            fontWeight: 400,
            color:      "#1a2e1a",
            margin:     0,
          }}
        >
          {navItem?.labelId ?? "KLA System"}
        </h1>
      </div>

      <div
        style={{
          fontFamily:    "'IBM Plex Mono', monospace",
          fontSize:      11,
          color:         "#7a9a7a",
          letterSpacing: "0.06em",
        }}
      >
        {new Date()
          .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
          .toUpperCase()}
      </div>
    </header>
  );
}
