/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║         PT. KUSUMA LESTARI AGRO — KLA System                 ║
 * ║         src/config/navigation.config.ts                      ║
 * ║                                                               ║
 * ║  Single source of truth for sidebar navigation.              ║
 * ║  Sidebar.tsx + Topbar.tsx both read from this file.          ║
 * ║                                                               ║
 * ║  Added: CMS section with Gallery entry → /cms/gallery        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

export type UserRole = "owner" | "admin" | "staff";

export interface NavLeaf {
  type:     "leaf";
  key:      string;
  path:     string;
  icon:     string;
  labelId:  string;         // Indonesian label shown in sidebar
  labelEn?: string;         // Optional English label
  roles?:   UserRole[];     // If omitted → visible to all roles
  badge?:   "new" | "beta" | "critical";
}

export interface NavGroup {
  type:     "group";
  key:      string;
  icon:     string;
  labelId:  string;
  roles?:   UserRole[];
  children: NavLeaf[];
}

export type NavItem = NavLeaf | NavGroup;

export interface NavSection {
  sectionKey:   string;
  sectionLabel: string;     // Section header label in sidebar
  items:        NavItem[];
}

// ─────────────────────────────────────────────────────────────
//  ROLE GUARD HELPER
// ─────────────────────────────────────────────────────────────

export function isAllowed(item: NavLeaf | NavGroup, role: UserRole): boolean {
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.includes(role);
}

// ─────────────────────────────────────────────────────────────
//  NAVIGATION TREE
// ─────────────────────────────────────────────────────────────

export const NAV_SECTIONS: NavSection[] = [

  // ── MAIN ────────────────────────────────────────────────────
  {
    sectionKey:   "main",
    sectionLabel: "",          // No label for the first section
    items: [
      {
        type:    "leaf",
        key:     "dashboard",
        path:    "/dashboard",
        icon:    "dashboard",
        labelId: "Dashboard",
      },
    ],
  },

  // ── CMS ─────────────────────────────────────────────────────
  {
    sectionKey:   "cms",
    sectionLabel: "Konten",
    items: [
      {
        type:    "leaf",
        key:     "cms-gallery",
        path:    "/cms/gallery",
        icon:    "book-open",
        labelId: "Galeri",
        roles:   ["owner", "admin"],
      },
      // Future CMS items — uncomment when pages are ready:
      // {
      //   type:    "leaf",
      //   key:     "cms-company",
      //   path:    "/cms/company",
      //   icon:    "building-2",
      //   labelId: "Profil Perusahaan",
      //   roles:   ["owner", "admin"],
      // },
      // {
      //   type:    "leaf",
      //   key:     "cms-team",
      //   path:    "/cms/team",
      //   icon:    "users-group",
      //   labelId: "Tim",
      //   roles:   ["owner", "admin"],
      // },
      // {
      //   type:    "leaf",
      //   key:     "cms-messages",
      //   path:    "/cms/messages",
      //   icon:    "clipboard-list",
      //   labelId: "Pesan Masuk",
      //   roles:   ["owner", "admin"],
      //   badge:   "new",
      // },
    ],
  },

  // ── SETTINGS ────────────────────────────────────────────────
  {
    sectionKey:   "settings",
    sectionLabel: "Pengaturan",
    items: [
      {
        type:    "leaf",
        key:     "settings-users",
        path:    "/settings/users",
        icon:    "users",
        labelId: "Pengguna",
        roles:   ["owner"],
      },
    ],
  },

];

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

/** Flatten all NavLeaf items across all sections (used by Sidebar + Topbar). */
export function flattenNavItems(): NavLeaf[] {
  const leaves: NavLeaf[] = [];
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.type === "leaf") {
        leaves.push(item);
      } else {
        leaves.push(...item.children);
      }
    }
  }
  return leaves;
}

/** Find the NavLeaf whose path matches the current location (used by Topbar). */
export function findNavItemByPath(pathname: string): NavLeaf | undefined {
  return flattenNavItems().find(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/")
  );
}
