// src/features/inventory/pages/StockMovementsPage.tsx
import { useState } from "react";
import PageHeader from "../../../components/shared/PageHeader";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import type { StockMovementList, MovementType } from "../../../types/inventory";
import { MOVEMENT_TYPE_LABELS } from "../../../types/inventory";
import { useDebounce } from "../../../hooks/useDebounce";

const DIRECTION_COLOR: Record<string, "green"|"red"> = { in:"green", out:"red" };

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value:"IN",      label:"Penerimaan Stok" },
  { value:"OUT",     label:"Pengeluaran Stok" },
  { value:"ADJ_IN",  label:"Penyesuaian Masuk" },
  { value:"ADJ_OUT", label:"Penyesuaian Keluar" },
  { value:"OPEN",    label:"Saldo Awal" },
];

function useMovements(params?: Record<string,unknown>) {
  return useQuery({
    queryKey: ["stock-movements", params],
    queryFn: () => api.get("/stock-movements/", { params }).then(r => r.data),
  });
}

function useProducts() {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api.get("/products/", { params: { page_size: 999 } }).then(r => {
      const d = r.data;
      return (d?.results ?? d ?? []) as any[];
    }),
  });
}

function useMovementCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/stock-movements/", data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stock-movements"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

function CreateMovementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: products = [] } = useProducts();
  const create = useMovementCreate();
  const [form, setForm] = useState({
    product:"", movement_type:"IN" as MovementType,
    movement_date: new Date().toISOString().split("T")[0],
    quantity:"", unit_cost:"0", reference:"", description:"",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      await create.mutateAsync(form);
      onClose();
      setForm({ product:"", movement_type:"IN", movement_date:new Date().toISOString().split("T")[0],
                quantity:"", unit_cost:"0", reference:"", description:"" });
    } catch {}
  };

  const F = (label: string, key: string, type="text", placeholder="") => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#4a6a4a", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</label>
      <input type={type} value={(form as any)[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{ width:"100%", boxSizing:"border-box", padding:"9px 12px", border:"1.5px solid #e0dbd0", borderRadius:8,
                 fontFamily:"'Instrument Sans',sans-serif", fontSize:14, color:"#1a2e1a", background:"#faf9f7", outline:"none" }} />
    </div>
  );

  const Sel = (label: string, key: string, options: { value: string; label: string }[]) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#4a6a4a", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</label>
      <select value={(form as any)[key]} onChange={e => set(key, e.target.value)}
        style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e0dbd0", borderRadius:8,
                 fontFamily:"'Instrument Sans',sans-serif", fontSize:14, background:"#faf9f7" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Catat Pergerakan Stok" width={500}>
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#4a6a4a", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>Produk</label>
        <select value={form.product} onChange={e => set("product", e.target.value)}
          style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e0dbd0", borderRadius:8,
                   fontFamily:"'Instrument Sans',sans-serif", fontSize:14, background:"#faf9f7" }}>
          <option value="">— Pilih Produk —</option>
          {(products as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
        </select>
      </div>

      {Sel("Jenis Pergerakan", "movement_type", MOVEMENT_TYPES)}
      {F("Tanggal", "movement_date", "date")}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <div>{F("Kuantitas", "quantity", "number", "0")}</div>
        <div>{F("Harga Satuan (Rp)", "unit_cost", "number", "0")}</div>
      </div>

      {F("Referensi / No. Dokumen", "reference", "text", "PO-001 / GR-001")}
      {F("Keterangan", "description", "text", "Opsional...")}

      {create.isError && (
        <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>⚠ Gagal menyimpan. Periksa data isian.</p>
      )}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} loading={create.isPending}
          disabled={!form.product || !form.quantity}>
          Catat Pergerakan
        </Button>
      </div>
    </Modal>
  );
}

export default function StockMovementsPage() {
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const deb = useDebounce(search, 350);

  const params: Record<string,unknown> = {};
  if (deb)        params.search = deb;
  if (typeFilter) params.movement_type = typeFilter;

  const { data, isLoading } = useMovements(params);
  const movements: StockMovementList[] = (data as any)?.results ?? (Array.isArray(data) ? data : []);

  const columns = [
    { key:"movement_date", header:"Tanggal",
      render:(r: StockMovementList) => <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>{r.movement_date}</span> },
    { key:"product_code", header:"Kode Produk",
      render:(r: StockMovementList) => <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#2d5a1e", fontWeight:600 }}>{r.product_code}</span> },
    { key:"product_name", header:"Nama Produk" },
    { key:"movement_type_label", header:"Jenis",
      render:(r: StockMovementList) => (
        <Badge label={r.movement_type_label} color={DIRECTION_COLOR[r.direction] ?? "gray"} />
      ) },
    { key:"quantity", header:"Qty", align:"right" as const,
      render:(r: StockMovementList) => (
        <span style={{ fontWeight:600, color: r.direction==="in" ? "#166534" : "#991b1b" }}>
          {r.direction==="in" ? "+" : "−"}{Number(r.quantity).toLocaleString("id-ID")}
        </span>
      ) },
    { key:"stock_after", header:"Stok Akhir", align:"right" as const,
      render:(r: StockMovementList) => <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>{Number(r.stock_after).toLocaleString("id-ID")}</span> },
    { key:"total_cost_fmt", header:"Total Nilai", align:"right" as const,
      render:(r: StockMovementList) => <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>{r.total_cost_fmt}</span> },
    { key:"reference", header:"Referensi",
      render:(r: StockMovementList) => <span style={{ color:"#7a9a7a", fontSize:12 }}>{r.reference || "—"}</span> },
  ];

  return (
    <div>
      <PageHeader title="Pergerakan Stok" subtitle="Riwayat seluruh pergerakan stok masuk dan keluar"
        actions={<Button onClick={() => setShowCreate(true)}>+ Catat Pergerakan</Button>} />

      <div style={{ display:"flex", gap:12, marginBottom:16 }}>
        <div style={{ flex:1, maxWidth:320 }}>
          <Input placeholder="Cari produk atau referensi..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding:"8px 14px", border:"1.5px solid #e0dbd0", borderRadius:8,
                   fontFamily:"'Instrument Sans',sans-serif", fontSize:13, background:"#faf9f7", color:"#1a2e1a" }}>
          <option value="">Semua Jenis</option>
          {MOVEMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <Card style={{ padding:0 }}>
        <Table columns={columns} data={movements} rowKey={r => r.id} loading={isLoading}
          emptyMessage="Belum ada pergerakan stok." />
      </Card>

      {(data as any)?.count > 0 && (
        <p style={{ fontSize:12, color:"#9a8f7a", marginTop:12, textAlign:"right" }}>{(data as any).count} pergerakan</p>
      )}

      <CreateMovementModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
