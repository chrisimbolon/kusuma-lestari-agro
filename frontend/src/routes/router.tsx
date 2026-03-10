// ============================================================
//  src/routes/router.tsx
//
//  Route architecture:
//  /           → LandingPage      (PUBLIC — no auth)
//  /login      → LoginPage        (PUBLIC — no auth)
//  /dashboard  → DashboardPage    (PROTECTED — AuthGuard)
//  /sales/*    → Sales pages      (PROTECTED)
//  ... etc
// ============================================================

import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import AuthGuard from "../middleware/AuthGuard";
import RoleGuard from "../middleware/RoleGuard";

// ── PUBLIC pages ───────────────────────────────────────────
const LandingPage        = lazy(() => import("../features/landing/pages/LandingPage"));
const LoginPage          = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage       = lazy(() => import("../features/auth/pages/RegisterPage"));

// ── Dashboard ──────────────────────────────────────────────
const DashboardPage      = lazy(() => import("../features/dashboard/pages/DashboardPage"));

// ── Penjualan (Sales) ──────────────────────────────────────
const QuotationsPage       = lazy(() => import("../features/sales/pages/QuotationsPage"));
const SalesOrdersPage      = lazy(() => import("../features/sales/pages/SalesOrdersPage"));
const DeliveryOrdersPage   = lazy(() => import("../features/sales/pages/DeliveryOrdersPage"));
const SalesInvoicesPage    = lazy(() => import("../features/sales/pages/SalesInvoicesPage"));
const ARReceiptsPage       = lazy(() => import("../features/ar/pages/ARReceiptsPage"));
const SalesReturnsPage     = lazy(() => import("../features/sales/pages/SalesReturnsPage"));
const CustomersPage        = lazy(() => import("../features/partners/pages/CustomersPage"));

// ── Pembelian (Purchasing) ─────────────────────────────────
const PurchaseOrdersPage   = lazy(() => import("../features/purchasing/pages/PurchaseOrdersPage"));
const GoodsReceiptPage     = lazy(() => import("../features/purchasing/pages/GoodsReceiptPage"));
const SupplierInvoicesPage = lazy(() => import("../features/purchasing/pages/SupplierInvoicesPage"));
const APPaymentsPage       = lazy(() => import("../features/ap/pages/APPaymentsPage"));
const PurchaseReturnsPage  = lazy(() => import("../features/purchasing/pages/PurchaseReturnsPage"));
const SuppliersPage        = lazy(() => import("../features/partners/pages/SuppliersPage"));

// ── Inventori ──────────────────────────────────────────────
const ProductsPage           = lazy(() => import("../features/inventory/pages/ProductsPage"));
const ProductDetailPage      = lazy(() => import("../features/inventory/pages/ProductDetailPage"));
const CategoriesPage         = lazy(() => import("../features/inventory/pages/CategoriesPage"));
const StockWarehousePage     = lazy(() => import("../features/inventory/pages/StockWarehousePage"));
const StockMovementsPage     = lazy(() => import("../features/inventory/pages/StockMovementsPage"));
const StockOpnamePage        = lazy(() => import("../features/inventory/pages/StockOpnamePage"));
const InventoryValuationPage = lazy(() => import("../features/inventory/pages/InventoryValuationPage"));

// ── Keuangan (Accounting) ──────────────────────────────────
const CoAPage              = lazy(() => import("../features/accounting/pages/CoAPage"));
const JournalsPage         = lazy(() => import("../features/accounting/pages/JournalsPage"));
const JournalDetailPage    = lazy(() => import("../features/accounting/pages/JournalDetailPage"));
const GeneralLedgerPage    = lazy(() => import("../features/accounting/pages/GeneralLedgerPage"));
const TrialBalancePage     = lazy(() => import("../features/accounting/pages/TrialBalancePage"));
const CashBankPage         = lazy(() => import("../features/accounting/pages/CashBankPage"));
const BankReconPage        = lazy(() => import("../features/accounting/pages/BankReconPage"));
const ReceivablesPage      = lazy(() => import("../features/accounting/pages/ReceivablesPage"));
const PayablesPage         = lazy(() => import("../features/accounting/pages/PayablesPage"));

// ── Laporan (Reports) ──────────────────────────────────────
const ReportSalesPage      = lazy(() => import("../features/reports/pages/ReportSalesPage"));
const ReportPurchasingPage = lazy(() => import("../features/reports/pages/ReportPurchasingPage"));
const ReportInventoryPage  = lazy(() => import("../features/reports/pages/ReportInventoryPage"));
const BalanceSheetPage     = lazy(() => import("../features/reports/pages/BalanceSheetPage"));
const ProfitLossPage       = lazy(() => import("../features/reports/pages/ProfitLossPage"));
const CashFlowPage         = lazy(() => import("../features/reports/pages/CashFlowPage"));
const TaxReportPage        = lazy(() => import("../features/reports/pages/TaxReportPage"));

// ── Pengaturan (Settings) ──────────────────────────────────
const CompanyProfilePage   = lazy(() => import("../features/settings/pages/CompanyProfilePage"));
const FiscalYearPage       = lazy(() => import("../features/settings/pages/FiscalYearPage"));
const TaxConfigPage        = lazy(() => import("../features/settings/pages/TaxConfigPage"));
const NumberSequencesPage  = lazy(() => import("../features/settings/pages/NumberSequencesPage"));
const RolesAccessPage      = lazy(() => import("../features/settings/pages/RolesAccessPage"));
const UserManagementPage   = lazy(() => import("../features/settings/pages/UserManagementPage"));

// ── Errors ─────────────────────────────────────────────────
const NotFoundPage         = lazy(() => import("../features/errors/NotFoundPage"));

// ── Suspense wrapper ───────────────────────────────────────
const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>{children}</Suspense>
);

// ── Protected shell ────────────────────────────────────────
// Wraps all routes that need authentication
const ProtectedShell = () => (
  <AuthGuard>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </AuthGuard>
);

// ══════════════════════════════════════════════════════════
//  ROUTER
// ══════════════════════════════════════════════════════════

export const router = createBrowserRouter([

  // ── PUBLIC ROUTES — no auth required ──────────────────
  {
    path:    "/",
    element: <Lazy><LandingPage /></Lazy>,
  },
  {
    path:    "/login",
    element: <Lazy><LoginPage /></Lazy>,
  },
  {
    path:    "/register",
    element: <Lazy><RegisterPage /></Lazy>,
  },

  // ── PROTECTED ROUTES — require authentication ──────────
  {
    element: <ProtectedShell />,
    children: [

      // Dashboard
      {
        path:    "/dashboard",
        element: <Lazy><DashboardPage /></Lazy>,
      },

      // ── Penjualan ──────────────────────────────────────
      {
        path: "sales",
        children: [
          { index: true,          element: <Navigate to="/sales/quotations" replace /> },
          { path: "quotations",   element: <Lazy><QuotationsPage /></Lazy> },
          { path: "orders",       element: <Lazy><SalesOrdersPage /></Lazy> },
          { path: "delivery",     element: <Lazy><DeliveryOrdersPage /></Lazy> },
          { path: "invoices",     element: <Lazy><SalesInvoicesPage /></Lazy> },
          { path: "receipts",     element: <Lazy><ARReceiptsPage /></Lazy> },
          { path: "returns",      element: <Lazy><SalesReturnsPage /></Lazy> },
          { path: "customers",    element: <Lazy><CustomersPage /></Lazy> },
        ],
      },

      // ── Pembelian ──────────────────────────────────────
      {
        path: "purchasing",
        element: (
          <RoleGuard allow={["admin", "owner"]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { index: true,            element: <Navigate to="/purchasing/orders" replace /> },
          { path: "orders",         element: <Lazy><PurchaseOrdersPage /></Lazy> },
          { path: "goods-receipt",  element: <Lazy><GoodsReceiptPage /></Lazy> },
          { path: "invoices",       element: <Lazy><SupplierInvoicesPage /></Lazy> },
          { path: "payments",       element: <Lazy><APPaymentsPage /></Lazy> },
          { path: "returns",        element: <Lazy><PurchaseReturnsPage /></Lazy> },
          { path: "suppliers",      element: <Lazy><SuppliersPage /></Lazy> },
        ],
      },

      // ── Inventori ──────────────────────────────────────
      {
        path: "inventory",
        children: [
          { index: true,              element: <Navigate to="/inventory/products" replace /> },
          { path: "products",         element: <Lazy><ProductsPage /></Lazy> },
          { path: "products/:id",     element: <Lazy><ProductDetailPage /></Lazy> },
          { path: "categories",       element: <Lazy><CategoriesPage /></Lazy> },
          { path: "stock",            element: <Lazy><StockWarehousePage /></Lazy> },
          { path: "movements",        element: <Lazy><StockMovementsPage /></Lazy> },
          {
            path: "stock-opname",
            element: (
              <RoleGuard allow={["admin", "owner"]}>
                <Lazy><StockOpnamePage /></Lazy>
              </RoleGuard>
            ),
          },
          {
            path: "valuation",
            element: (
              <RoleGuard allow={["admin", "owner"]}>
                <Lazy><InventoryValuationPage /></Lazy>
              </RoleGuard>
            ),
          },
        ],
      },

      // ── Keuangan ───────────────────────────────────────
      {
        path: "accounting",
        element: (
          <RoleGuard allow={["admin", "owner"]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { index: true,              element: <Navigate to="/accounting/journals" replace /> },
          { path: "coa",              element: <Lazy><CoAPage /></Lazy> },
          { path: "journals",         element: <Lazy><JournalsPage /></Lazy> },
          { path: "journals/:id",     element: <Lazy><JournalDetailPage /></Lazy> },
          { path: "ledger",           element: <Lazy><GeneralLedgerPage /></Lazy> },
          { path: "trial-balance",    element: <Lazy><TrialBalancePage /></Lazy> },
          { path: "cash-bank",        element: <Lazy><CashBankPage /></Lazy> },
          { path: "reconciliation",   element: <Lazy><BankReconPage /></Lazy> },
          { path: "receivables",      element: <Lazy><ReceivablesPage /></Lazy> },
          { path: "payables",         element: <Lazy><PayablesPage /></Lazy> },
        ],
      },

      // ── Laporan ────────────────────────────────────────
      {
        path: "reports",
        element: (
          <RoleGuard allow={["admin", "owner"]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { index: true,              element: <Navigate to="/reports/sales" replace /> },
          { path: "sales",            element: <Lazy><ReportSalesPage /></Lazy> },
          { path: "purchasing",       element: <Lazy><ReportPurchasingPage /></Lazy> },
          { path: "inventory",        element: <Lazy><ReportInventoryPage /></Lazy> },
          { path: "balance-sheet",    element: <Lazy><BalanceSheetPage /></Lazy> },
          { path: "profit-loss",      element: <Lazy><ProfitLossPage /></Lazy> },
          { path: "cash-flow",        element: <Lazy><CashFlowPage /></Lazy> },
          { path: "tax",              element: <Lazy><TaxReportPage /></Lazy> },
        ],
      },

      // ── Pengaturan ─────────────────────────────────────
      {
        path: "settings",
        children: [
          { index: true,              element: <Navigate to="/settings/company" replace /> },
          { path: "company",          element: <Lazy><CompanyProfilePage /></Lazy> },
          { path: "fiscal-year",      element: <Lazy><FiscalYearPage /></Lazy> },
          {
            path: "tax",
            element: (
              <RoleGuard allow={["owner"]}>
                <Lazy><TaxConfigPage /></Lazy>
              </RoleGuard>
            ),
          },
          { path: "sequences",        element: <Lazy><NumberSequencesPage /></Lazy> },
          {
            path: "roles",
            element: (
              <RoleGuard allow={["owner"]}>
                <Lazy><RolesAccessPage /></Lazy>
              </RoleGuard>
            ),
          },
          { path: "users",            element: <Lazy><UserManagementPage /></Lazy> },
        ],
      },
    ],
  },

  // ── 404 ────────────────────────────────────────────────
  {
    path:    "*",
    element: <Lazy><NotFoundPage /></Lazy>,
  },
]);
