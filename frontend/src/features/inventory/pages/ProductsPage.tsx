// src/features/inventory/pages/ProductsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/shared/PageHeader";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductList, useProductCreate } from "../hooks/useProduct";
import api from "../../../lib/axios";
import type { ProductList, UnitOfMeasure } from "../../../types/inventory";
import { useDebounce } from "../../../hooks/useDebounce";

const UOM_OPTIONS: { value: UnitOfMeasure; label: string }[] = [
  { value:"KG",   label:"Kilogram"  },
  { value:"TON",  label:"Ton"       },
  { value:"SAK",  label:"Sak (50kg)"},
  { value:"LTR",  label:"Liter"     },
  { value:"UNIT", label:"Unit"      },
];

const STATUS_COLOR: Record<string, "green"|"yellow"|"red"> = {
  NORMAL:"green", LOW_STOCK:"yellow", OUT_OF_STOCK:"red",
};

const EMPTY_FORM = {
  code:"", name:"", category:"", unit_of_measure:"SAK" as UnitOfMeasure,
  standard_cost:"0", selling_price:"0", minimum_stock:"0", maximum_stock:"0", description:"",
};

// ── Inline field helper ───────────────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display:"block", fontSize:12, fontWeight:600, color:"#4a6a4a",
        marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em",
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width:"100%", boxSizing:"border-box", padding:"9px 12px",
          border:"1.5px solid #e0dbd0", borderRadius:8,
          fontFamily:"'Instrument Sans',sans-serif", fontSize:14,
          color:"#1a2e1a", background:"#faf9f7", outline:"none",
        }}
        onFocus={e  => e.target.style.borderColor = "#2d5a1e"}
        onBlur={e   => e.target.style.borderColor = "#e0dbd0"}
      />
    </div>
  );
}

// ── Create Product Modal ──────────────────────────────────────
function CreateProductModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm]   = useState(EMPTY_FORM);
  const [cats, setCats]   = useState<any[]>([]);
  const create            = useProductCreate();

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // ✅ Load categories + reset form ONLY when modal opens
  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    create.reset();
    api.get("/categories/").then(r => {
      const d = r.data;
      setCats(d?.results ?? d ?? []);
    }).catch(() => setCats([]));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    try {
      await create.mutateAsync(form as any);
      onClose();
    } catch {
      // error shown in UI
    }
  };

  const canSubmit = form.code.trim() && form.name.trim() && form.category;

  return (
    <Modal open={open} onClose={onClose} title="Tambah Produk Baru" width={560}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <Field label="Kode Produk"   value={form.code}   onChange={v => set("code", v)}   placeholder="NPK-15-15-15" />
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#4a6a4a", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>
            Satuan
          </label>
          <select
            value={form.unit_of_measure}
            onChange={e => set("unit_of_measure", e.target.value)}
            style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e0dbd0", borderRadius:8, fontFamily:"'Instrument Sans',sans-serif", fontSize:14, background:"#faf9f7", color:"#1a2e1a", outline:"none" }}
          >
            {UOM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <Field label="Nama Produk" value={form.name} onChange={v => set("name", v)} placeholder="Pupuk NPK 15-15-15" />

      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#4a6a4a", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em" }}>
          Kategori
        </label>
        <select
          value={form.category}
          onChange={e => set("category", e.target.value)}
          style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e0dbd0", borderRadius:8, fontFamily:"'Instrument Sans',sans-serif", fontSize:14, background:"#faf9f7", color:"#1a2e1a", outline:"none" }}
        >
          <option value="">— Pilih Kategori —</option>
          {cats.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {cats.length === 0 && (
          <p style={{ fontSize:12, color:"#e07a10", marginTop:5 }}>
            ⚠ Belum ada kategori. Buat kategori terlebih dahulu.
          </p>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
        <Field label="Harga Pokok (Rp)" value={form.standard_cost} onChange={v => set("standard_cost", v)} type="number" placeholder="0" />
        <Field label="Harga Jual (Rp)"  value={form.selling_price}  onChange={v => set("selling_price",  v)} type="number" placeholder="0" />
        <Field label="Stok Minimum"      value={form.minimum_stock}  onChange={v => set("minimum_stock",  v)} type="number" placeholder="0" />
        <Field label="Stok Maksimum"     value={form.maximum_stock}  onChange={v => set("maximum_stock",  v)} type="number" placeholder="0" />
      </div>

      <Field label="Deskripsi" value={form.description} onChange={v => set("description", v)} placeholder="Opsional..." />

      {create.isError && (
        <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>
          ⚠ {(create.error as any)?.response?.data?.code?.[0]
            ?? (create.error as any)?.response?.data?.detail
            ?? "Gagal menyimpan. Periksa kode produk belum digunakan."}
        </p>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
        <Button variant="ghost" onClick={onClose} disabled={create.isPending}>Batal</Button>
        <Button type="button" onClick={handleSubmit} loading={create.isPending} disabled={!canSubmit}>
          Simpan Produk
        </Button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const debouncedSearch             = useDebounce(search, 350);

  const { data, isLoading } = useProductList(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );
  const products: ProductList[] = (data as any)?.results ?? (Array.isArray(data) ? data : []);

  const columns = [
    {
      key:"code", header:"Kode",
      render:(r: ProductList) => (
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#2d5a1e", fontWeight:600 }}>{r.code}</span>
      ),
    },
    { key:"name", header:"Nama Produk" },
    { key:"category_name", header:"Kategori" },
    {
      key:"uom_label", header:"Satuan",
      render:(r: ProductList) => (
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#7a9a7a" }}>{r.uom_label}</span>
      ),
    },
    {
      key:"current_stock", header:"Stok", align:"right" as const,
      render:(r: ProductList) => (
        <span style={{ fontWeight:600, color:Number(r.current_stock) <= 0 ? "#dc2626" : "#1a2e1a" }}>
          {Number(r.current_stock).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key:"average_cost_fmt", header:"HPP Rata-rata", align:"right" as const,
      render:(r: ProductList) => (
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12 }}>{r.average_cost_fmt}</span>
      ),
    },
    {
      key:"stock_value_fmt", header:"Nilai Stok", align:"right" as const,
      render:(r: ProductList) => (
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#2d5a1e" }}>{r.stock_value_fmt}</span>
      ),
    },
    {
      key:"stock_status", header:"Status",
      render:(r: ProductList) => (
        <Badge label={r.stock_status?.label ?? "—"} color={STATUS_COLOR[r.stock_status?.code] ?? "gray"} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Produk"
        subtitle="Manajemen master data produk pupuk"
        actions={
          <Button type="button" onClick={() => setShowCreate(true)}>
            + Tambah Produk
          </Button>
        }
      />

      <div style={{ marginBottom:16, maxWidth:360 }}>
        <Input
          placeholder="Cari kode atau nama produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card style={{ padding:0 }}>
        <Table
          columns={columns}
          data={products}
          rowKey={r => r.id}
          loading={isLoading}
          onRowClick={r => navigate(`/inventory/products/${r.id}`)}
          emptyMessage="Belum ada produk. Klik '+ Tambah Produk' untuk mulai."
        />
      </Card>

      {(data as any)?.count > 0 && (
        <p style={{ fontSize:12, color:"#9a8f7a", marginTop:12, textAlign:"right" }}>
          {(data as any).count} produk
        </p>
      )}

      <CreateProductModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
