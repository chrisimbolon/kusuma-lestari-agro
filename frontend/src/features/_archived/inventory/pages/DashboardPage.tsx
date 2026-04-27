// src/features/dashboard/pages/DashboardPage.tsx
import { useAuthStore } from "../../../store/authStore";
import Card from "../../../components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios";
import { useNavigate } from "react-router-dom";

function useInventoryValuation() {
  return useQuery({
    queryKey: ["products", "valuation"],
    queryFn: () => api.get("/products/valuation/").then(r => r.data),
    refetchInterval: 60_000,
  });
}

function useLowStockProducts() {
  return useQuery({
    queryKey: ["products", "lowstock"],
    queryFn: () => api.get("/products/low_stock/").then(r => {
      const d = r.data;
      return (d?.results ?? d ?? []) as any[];
    }),
  });
}

function useRecentMovements() {
  return useQuery({
    queryKey: ["stock-movements", "recent"],
    queryFn: () => api.get("/stock-movements/", { params: { page_size: 8 } }).then(r => {
      const d = r.data;
      return (d?.results ?? d ?? []) as any[];
    }),
  });
}

function StatCard({ label, value, icon, color, sub, onClick }: {
  label: string; value: string; icon: string; color: string; sub?: string; onClick?: () => void;
}) {
  return (
    <Card style={{ padding:20, cursor: onClick ? "pointer" : undefined, transition:"box-shadow 0.15s" }}
      onClick={onClick}
      onMouseEnter={onClick ? (e => (e.currentTarget as any).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)") : undefined}
      onMouseLeave={onClick ? (e => (e.currentTarget as any).style.boxShadow = "") : undefined}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:11, color:"#7a9a7a", margin:"0 0 6px", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</p>
          <p style={{ fontSize:24, fontFamily:"'DM Serif Display',serif", fontWeight:400, color:"#1a2e1a", margin:0 }}>{value}</p>
          {sub && <p style={{ fontSize:12, color:"#9a8f7a", margin:"4px 0 0" }}>{sub}</p>}
        </div>
        <div style={{ width:40, height:40, borderRadius:10, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
      </div>
    </Card>
  );
}

const MONTH_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: valuation } = useInventoryValuation();
  const { data: lowStockProducts = [] } = useLowStockProducts();
  const { data: recentMovements = [] } = useRecentMovements();

  const now = new Date();
  const monthLabel = `${MONTH_ID[now.getMonth()]} ${now.getFullYear()}`;

  const lowCount = (lowStockProducts as any[]).length;
  const totalValue = (valuation as any)?.total_inventory_value_fmt ?? "Rp 0";
  const productCount = (valuation as any)?.product_count ?? 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400, fontSize:26, color:"#1a2e1a", margin:"0 0 4px" }}>
          Selamat datang, {user?.full_name?.split(" ")[0] ?? "—"} 👋
        </h1>
        <p style={{ color:"#7a9a7a", fontSize:14, margin:0 }}>PT. Kusuma Lestari Agro — Sistem ERP Terpadu</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:16, marginBottom:24 }}>
        <StatCard label="Total Piutang" value="Rp 0" icon="📈" color="#dcfce7" sub="Belum ada data" />
        <StatCard label="Total Hutang" value="Rp 0" icon="📉" color="#fee2e2" sub="Belum ada data" />
        <StatCard
          label="Stok Rendah"
          value={`${lowCount} produk`}
          icon="⚠️" color="#fef9c3"
          sub={lowCount > 0 ? "Perlu restock segera" : "Semua stok normal"}
          onClick={() => navigate("/inventory/products")}
        />
        <StatCard
          label="Nilai Persediaan"
          value={totalValue}
          icon="📦" color="#dbeafe"
          sub={`${productCount} produk aktif`}
          onClick={() => navigate("/inventory/products")}
        />
      </div>

      {/* Lower panels */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Low Stock Alert */}
        <Card style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400, color:"#1a2e1a", margin:0, fontSize:16 }}>
              Produk Stok Rendah
            </h3>
            <span style={{ fontSize:11, color:"#2d5a1e", cursor:"pointer", fontWeight:600 }}
              onClick={() => navigate("/inventory/products")}>Lihat Semua →</span>
          </div>
          {(lowStockProducts as any[]).length === 0 ? (
            <p style={{ color:"#7a9a7a", fontSize:14, margin:0 }}>✅ Semua stok dalam kondisi normal.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {(lowStockProducts as any[]).slice(0, 5).map((p: any) => (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"8px 10px", borderRadius:8, background:Number(p.current_stock)<=0 ? "#fee2e2" : "#fef9c3" }}>
                  <div>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#2d5a1e", fontWeight:600 }}>{p.code}</span>
                    <span style={{ fontSize:13, color:"#1a2e1a", marginLeft:8 }}>{p.name}</span>
                  </div>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700,
                    color: Number(p.current_stock)<=0 ? "#991b1b" : "#854d0e" }}>
                    {Number(p.current_stock).toLocaleString("id-ID")} {p.uom_label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Stock Movements */}
        <Card style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400, color:"#1a2e1a", margin:0, fontSize:16 }}>
              Pergerakan Stok Terbaru
            </h3>
            <span style={{ fontSize:11, color:"#2d5a1e", cursor:"pointer", fontWeight:600 }}
              onClick={() => navigate("/inventory/stock-movements")}>Lihat Semua →</span>
          </div>
          {(recentMovements as any[]).length === 0 ? (
            <p style={{ color:"#7a9a7a", fontSize:14, margin:0 }}>Belum ada pergerakan stok.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {(recentMovements as any[]).map((m: any) => (
                <div key={m.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"6px 0", borderBottom:"1px solid #f0ebe0" }}>
                  <div>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#2d5a1e", fontWeight:600 }}>{m.product_code}</span>
                    <span style={{ fontSize:12, color:"#7a9a7a", marginLeft:8 }}>{m.movement_type_label}</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:700,
                      color: m.direction==="in" ? "#166534" : "#991b1b" }}>
                      {m.direction==="in" ? "+" : "−"}{Number(m.quantity).toLocaleString("id-ID")}
                    </span>
                    <div style={{ fontSize:10, color:"#9a8f7a" }}>{m.movement_date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
