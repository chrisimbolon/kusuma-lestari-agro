import Card from "../../../components/ui/Card";
import { useAuthStore } from "../../../store/authStore";

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <Card style={{ padding:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:12, color:"#7a9a7a", margin:"0 0 6px", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</p>
          <p style={{ fontSize:24, fontFamily:"'DM Serif Display',serif", fontWeight:400, color:"#1a2e1a", margin:0 }}>{value}</p>
        </div>
        <div style={{ width:40, height:40, borderRadius:10, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400, fontSize:26, color:"#1a2e1a", margin:"0 0 4px" }}>
          Selamat datang, {user?.full_name?.split(" ")[0] ?? "—"} !
        </h1>
        <p style={{ color:"#7a9a7a", fontSize:14, margin:0 }}>PT. Kusuma Lestari Agro — Sistem ERP Terpadu</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:16, marginBottom:24 }}>
        <StatCard label="Total Piutang" value="Rp 0" icon="📈" color="#dcfce7" />
        <StatCard label="Total Hutang" value="Rp 0" icon="📉" color="#fee2e2" />
        <StatCard label="Stok Rendah" value="0 produk" icon="⚠️" color="#fef9c3" />
        <StatCard label="Nilai Persediaan" value="Rp 0" icon="📦" color="#dbeafe" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card style={{ padding:20 }}>
          <h3 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400, color:"#1a2e1a", margin:"0 0 16px", fontSize:16 }}>Sales Order Tertunda</h3>
          <p style={{ color:"#7a9a7a", fontSize:14 }}>Belum ada data tersedia.</p>
        </Card>
        <Card style={{ padding:20 }}>
          <h3 style={{ fontFamily:"'DM Serif Display',serif", fontWeight:400, color:"#1a2e1a", margin:"0 0 16px", fontSize:16 }}>Piutang Jatuh Tempo</h3>
          <p style={{ color:"#7a9a7a", fontSize:14 }}>Belum ada data tersedia.</p>
        </Card>
      </div>
    </div>
  );
}
