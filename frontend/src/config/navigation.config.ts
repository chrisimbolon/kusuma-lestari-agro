// ============================================================
//  PT. KUSUMA LESTARI AGRO — KLA System
//  src/config/navigation.config.ts
//
//  SINGLE SOURCE OF TRUTH for the entire ERP menu structure.
//  Both Sidebar.tsx and router.tsx consume this file.
//  Adding a page = add it here ONLY. Nowhere else.
//
//  Architecture follows proper accounting + ERP principles:
//  Sales:      Quotation → Order → Delivery → Invoice → Payment
//  Purchasing: PO → Goods Receipt → Supplier Invoice → Payment
//  Accounting: CoA → Journal → Ledger → Trial Balance → Reports
// ============================================================

export type UserRole = "owner" | "admin" | "staff";

export type BadgeType = "new" | "beta" | "critical";

export interface NavLeaf {
  type:         "leaf";
  key:          string;
  label:        string;
  labelId:      string;         // Bahasa Indonesia label
  path:         string;
  icon:         string;
  badge?:       BadgeType;
  roles?:       UserRole[];     // undefined = all roles allowed
}

export interface NavGroup {
  type:         "group";
  key:          string;
  label:        string;
  labelId:      string;
  icon:         string;
  roles?:       UserRole[];
  children:     NavLeaf[];
}

export interface NavSection {
  sectionKey:   string;
  sectionLabel: string;
  items:        Array<NavLeaf | NavGroup>;
}

// ─────────────────────────────────────────────────────────────
//  COMPLETE ERP NAVIGATION — Architecturally Correct
// ─────────────────────────────────────────────────────────────

export const NAV_SECTIONS: NavSection[] = [

  // ── OVERVIEW ──────────────────────────────────────────────
  {
    sectionKey:   "overview",
    sectionLabel: "",
    items: [
      {
        type:    "leaf",
        key:     "dashboard",
        label:   "Dashboard",
        labelId: "Dashboard",
        path:    "/dashboard",
        icon:    "dashboard",
      },
    ],
  },

  // ── PENJUALAN (Sales) ─────────────────────────────────────
  // Correct cycle: Penawaran → SO → Surat Jalan → Invoice → Terima Bayar
  {
    sectionKey:   "penjualan",
    sectionLabel: "Penjualan",
    items: [
      {
        type:    "leaf",
        key:     "quotations",
        label:   "Penawaran",
        labelId: "Penawaran",
        path:    "/sales/quotations",
        icon:    "quote",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "sales-orders",
        label:   "Sales Order",
        labelId: "Sales Order",
        path:    "/sales/orders",
        icon:    "clipboard-list",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "delivery-orders",
        label:   "Surat Jalan",
        labelId: "Surat Jalan",
        path:    "/sales/delivery",
        icon:    "truck",
        roles:   ["admin", "owner", "staff"],
        badge:   "new",
        // ↑ Triggers: Dr COGS / Cr Inventory  +  Inventory stock OUT
      },
      {
        type:    "leaf",
        key:     "sales-invoices",
        label:   "Faktur Penjualan",
        labelId: "Faktur Penjualan",
        path:    "/sales/invoices",
        icon:    "file-invoice",
        roles:   ["admin", "owner", "staff"],
        // ↑ Creates AR: Dr Piutang / Cr Pendapatan
      },
      {
        type:    "leaf",
        key:     "ar-receipts",
        label:   "Terima Pembayaran",
        labelId: "Terima Pembayaran",
        path:    "/sales/receipts",
        icon:    "wallet-in",
        roles:   ["admin", "owner"],
        // ↑ Settles AR: Dr Bank / Cr Piutang
      },
      {
        type:    "leaf",
        key:     "sales-returns",
        label:   "Retur Penjualan",
        labelId: "Retur Penjualan",
        path:    "/sales/returns",
        icon:    "return-left",
        roles:   ["admin", "owner"],
      },
      {
        type:    "leaf",
        key:     "customers",
        label:   "Data Pelanggan",
        labelId: "Data Pelanggan",
        path:    "/sales/customers",
        icon:    "users-group",
        roles:   ["admin", "owner", "staff"],
      },
    ],
  },

  // ── PEMBELIAN (Purchasing) ────────────────────────────────
  // Correct cycle: PO → Penerimaan Barang → Invoice Supplier → Bayar
  {
    sectionKey:   "pembelian",
    sectionLabel: "Pembelian",
    items: [
      {
        type:    "leaf",
        key:     "purchase-orders",
        label:   "Purchase Order",
        labelId: "Purchase Order",
        path:    "/purchasing/orders",
        icon:    "shopping-bag",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "goods-receipt",
        label:   "Penerimaan Barang",
        labelId: "Penerimaan Barang",
        path:    "/purchasing/goods-receipt",
        icon:    "package-check",
        roles:   ["admin", "owner", "staff"],
        badge:   "new",
        // ↑ Triggers: Dr Persediaan / Cr Hutang Usaha  +  Inventory IN
      },
      {
        type:    "leaf",
        key:     "supplier-invoices",
        label:   "Invoice Supplier",
        labelId: "Invoice Supplier",
        path:    "/purchasing/invoices",
        icon:    "file-text",
        roles:   ["admin", "owner"],
        // ↑ 3-way match: PO ↔ Goods Receipt ↔ Supplier Invoice
      },
      {
        type:    "leaf",
        key:     "ap-payments",
        label:   "Bayar Supplier",
        labelId: "Bayar Supplier",
        path:    "/purchasing/payments",
        icon:    "wallet-out",
        roles:   ["admin", "owner"],
        // ↑ Settles AP: Dr Hutang / Cr Bank
      },
      {
        type:    "leaf",
        key:     "purchase-returns",
        label:   "Retur Pembelian",
        labelId: "Retur Pembelian",
        path:    "/purchasing/returns",
        icon:    "return-right",
        roles:   ["admin", "owner"],
      },
      {
        type:    "leaf",
        key:     "suppliers",
        label:   "Data Supplier",
        labelId: "Data Supplier",
        path:    "/purchasing/suppliers",
        icon:    "building-store",
        roles:   ["admin", "owner", "staff"],
      },
    ],
  },

  // ── INVENTORI ─────────────────────────────────────────────
  {
    sectionKey:   "inventori",
    sectionLabel: "Inventori",
    items: [
      {
        type:    "leaf",
        key:     "products",
        label:   "Produk",
        labelId: "Produk",
        path:    "/inventory/products",
        icon:    "box",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "product-categories",
        label:   "Kategori Produk",
        labelId: "Kategori Produk",
        path:    "/inventory/categories",
        icon:    "layers",
        roles:   ["admin", "owner"],
      },
      {
        type:    "leaf",
        key:     "stock-warehouse",
        label:   "Stok Gudang",
        labelId: "Stok Gudang",
        path:    "/inventory/stock",
        icon:    "warehouse",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "stock-movements",
        label:   "Pergerakan Stok",
        labelId: "Pergerakan Stok",
        path:    "/inventory/movements",
        icon:    "arrows-exchange",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "stock-opname",
        label:   "Stock Opname",
        labelId: "Stock Opname",
        path:    "/inventory/stock-opname",
        icon:    "clipboard-check",
        roles:   ["admin", "owner"],
        badge:   "new",
        // ↑ Physical count → Adj journal Dr/Cr Persediaan vs Selisih Stok
      },
      {
        type:    "leaf",
        key:     "inventory-valuation",
        label:   "Valuasi Persediaan",
        labelId: "Valuasi Persediaan",
        path:    "/inventory/valuation",
        icon:    "chart-bar",
        roles:   ["admin", "owner"],
        // ↑ WAC-based total value from /api/products/valuation/
      },
    ],
  },

  // ── KEUANGAN (Accounting / Finance) ──────────────────────
  // Complete accounting cycle: CoA → Journal → Ledger → TB → Reports
  {
    sectionKey:   "keuangan",
    sectionLabel: "Keuangan",
    items: [
      {
        type:    "leaf",
        key:     "chart-of-accounts",
        label:   "Buku Akun (CoA)",
        labelId: "Buku Akun",
        path:    "/accounting/coa",
        icon:    "list-tree",
        roles:   ["admin", "owner"],
        // ↑ /api/coa/ — 73 KLA accounts
      },
      {
        type:    "leaf",
        key:     "journals",
        label:   "Jurnal Umum",
        labelId: "Jurnal Umum",
        path:    "/accounting/journals",
        icon:    "book-open",
        roles:   ["admin", "owner"],
        // ↑ /api/journals/ — double-entry, NOT "Transaksi"
      },
      {
        type:    "leaf",
        key:     "general-ledger",
        label:   "Buku Besar",
        labelId: "Buku Besar",
        path:    "/accounting/ledger",
        icon:    "book",
        roles:   ["admin", "owner"],
        // ↑ /api/ledger/ — read-only, immutable GL
      },
      {
        type:    "leaf",
        key:     "trial-balance",
        label:   "Neraca Saldo",
        labelId: "Neraca Saldo",
        path:    "/accounting/trial-balance",
        icon:    "scale",
        roles:   ["admin", "owner"],
        // ↑ /api/trial-balance/generate/
      },
      {
        type:    "leaf",
        key:     "cash-bank",
        label:   "Kas & Bank",
        labelId: "Kas & Bank",
        path:    "/accounting/cash-bank",
        icon:    "banknote",
        roles:   ["admin", "owner", "staff"],
        // ↑ Ledger view filtered to 1-1001, 1-1101, 1-1102, 1-1103
      },
      {
        type:    "leaf",
        key:     "bank-reconciliation",
        label:   "Rekonsiliasi Bank",
        labelId: "Rekonsiliasi Bank",
        path:    "/accounting/reconciliation",
        icon:    "git-compare",
        roles:   ["admin", "owner"],
        badge:   "new",
        // ↑ Match bank statement vs GL entries
      },
      {
        type:    "leaf",
        key:     "accounts-receivable",
        label:   "Piutang Usaha",
        labelId: "Piutang Usaha",
        path:    "/accounting/receivables",
        icon:    "arrow-down-circle",
        roles:   ["admin", "owner"],
        // ↑ /api/ar/ — aging, payments, overdue alerts
      },
      {
        type:    "leaf",
        key:     "accounts-payable",
        label:   "Hutang Usaha",
        labelId: "Hutang Usaha",
        path:    "/accounting/payables",
        icon:    "arrow-up-circle",
        roles:   ["admin", "owner"],
        // ↑ /api/partners/{id}/ap_summary/
      },
    ],
  },

  // ── LAPORAN (Reports) ──────────────────────────────────────
  // All 3 mandatory SAK ETAP financial statements included
  {
    sectionKey:   "laporan",
    sectionLabel: "Laporan",
    items: [
      {
        type:    "leaf",
        key:     "report-sales",
        label:   "Laporan Penjualan",
        labelId: "Laporan Penjualan",
        path:    "/reports/sales",
        icon:    "trending-up",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "report-purchasing",
        label:   "Laporan Pembelian",
        labelId: "Laporan Pembelian",
        path:    "/reports/purchasing",
        icon:    "trending-down",
        roles:   ["admin", "owner"],
      },
      {
        type:    "leaf",
        key:     "report-inventory",
        label:   "Laporan Persediaan",
        labelId: "Laporan Persediaan",
        path:    "/reports/inventory",
        icon:    "package",
        roles:   ["admin", "owner", "staff"],
      },
      {
        type:    "leaf",
        key:     "balance-sheet",
        label:   "Neraca",
        labelId: "Neraca",
        path:    "/reports/balance-sheet",
        icon:    "landmark",
        roles:   ["admin", "owner"],
        // SAK ETAP mandatory #1
      },
      {
        type:    "leaf",
        key:     "profit-loss",
        label:   "Laba Rugi",
        labelId: "Laba Rugi",
        path:    "/reports/profit-loss",
        icon:    "bar-chart-2",
        roles:   ["admin", "owner"],
        // SAK ETAP mandatory #2
      },
      {
        type:    "leaf",
        key:     "cash-flow-report",
        label:   "Arus Kas",
        labelId: "Arus Kas",
        path:    "/reports/cash-flow",
        icon:    "activity",
        roles:   ["admin", "owner"],
        // SAK ETAP mandatory #3
      },
      {
        type:    "leaf",
        key:     "tax-report",
        label:   "Laporan Pajak",
        labelId: "Laporan Pajak",
        path:    "/reports/tax",
        icon:    "receipt",
        roles:   ["admin", "owner"],
        // PPN Keluaran + PPN Masukan + PPh
      },
    ],
  },

  // ── PENGATURAN (Settings) ─────────────────────────────────
  {
    sectionKey:   "pengaturan",
    sectionLabel: "Pengaturan",
    items: [
      {
        type:    "leaf",
        key:     "company-profile",
        label:   "Profil Perusahaan",
        labelId: "Profil Perusahaan",
        path:    "/settings/company",
        icon:    "building-2",
        roles:   ["admin", "owner"],
      },
      {
        type:    "leaf",
        key:     "fiscal-year-settings",
        label:   "Tahun Fiskal",
        labelId: "Tahun Fiskal",
        path:    "/settings/fiscal-year",
        icon:    "calendar-range",
        roles:   ["admin", "owner"],
      },
      {
        type:    "leaf",
        key:     "tax-config",
        label:   "Konfigurasi Pajak",
        labelId: "Konfigurasi Pajak",
        path:    "/settings/tax",
        icon:    "percent",
        roles:   ["owner"],
      },
      {
        type:    "leaf",
        key:     "number-sequences",
        label:   "Format Penomoran",
        labelId: "Format Penomoran",
        path:    "/settings/sequences",
        icon:    "hash",
        roles:   ["admin", "owner"],
      },
      {
        type:    "leaf",
        key:     "roles-access",
        label:   "Peran & Akses",
        labelId: "Peran & Akses",
        path:    "/settings/roles",
        icon:    "shield-check",
        roles:   ["owner"],
      },
      {
        type:    "leaf",
        key:     "user-management",
        label:   "Manajemen Pengguna",
        labelId: "Manajemen Pengguna",
        path:    "/settings/users",
        icon:    "users",
        roles:   ["admin", "owner"],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  HELPERS — used by Sidebar + router
// ─────────────────────────────────────────────────────────────

export const flattenNavItems = (): NavLeaf[] => {
  const leaves: NavLeaf[] = [];
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.type === "leaf") leaves.push(item);
      else item.children.forEach(c => leaves.push(c));
    }
  }
  return leaves;
};

export const findNavItemByPath = (path: string): NavLeaf | undefined =>
  flattenNavItems().find(item => item.path === path);

export const isAllowed = (item: NavLeaf, role: UserRole): boolean =>
  !item.roles || item.roles.includes(role);
